require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors = require('cors');
const path = require('path');
const si = require('systeminformation');
const axios = require('axios');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
app.use(express.json());
app.use(cors());

const distDir = path.join(__dirname, "dist");
app.use(express.static(distDir));

// Domains and default values from .env
const DOMAIN = process.env.VITE_DASHBOARD_DOMAIN || 'example.com';
const DEFAULT_IP = process.env.VITE_DEFAULT_IP || '192.168.1.1';

let db;

// ─── In-memory log buffer for WebSocket broadcasting ─────────────────────────
let logBuffer = [];
function addLog(level, message) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const entry = { time, level, message };
    logBuffer.push(entry);
    if (logBuffer.length > 200) logBuffer = logBuffer.slice(-200);
    // Broadcast to all WS clients immediately
    broadcast('logs', { logs: logBuffer });
    return entry;
}

// ─── WebSocket infrastructure ────────────────────────────────────────────────
const clients = new Set();

function broadcast(channel, data) {
    const message = JSON.stringify({ channel, data });
    for (const ws of clients) {
        if (ws.readyState === 1) { // WebSocket.OPEN
            ws.send(message);
        }
    }
}

// Cache for data channels → avoids re-fetching on every new WS client connect
const dataCache = {
    stats: null,
    statsHistory: null,
    docker: null,
    services: null,
    weather: null,
    status: null,
    logs: null,
};

// ─── Data fetchers (shared between REST and WS) ─────────────────────────────

async function fetchStats() {
    try {
        const [cpu, cpuTemp, mem, disk] = await Promise.all([
            si.currentLoad(),
            si.cpuTemperature(),
            si.mem(),
            si.fsSize(),
        ]);
        const uptime = si.time().uptime;

        const timestamp = Date.now();
        const cpuValue = Math.round(cpu.currentLoad);
        const ramValue = Math.round((mem.active / mem.total) * 100);
        const tempValue = cpuTemp.main !== -1 ? Math.round(cpuTemp.main) : null;

        // Store in history
        await db.run('INSERT INTO stats_history (timestamp, cpu, ram) VALUES (?, ?, ?)', [timestamp, cpuValue, ramValue]);
        await db.run('DELETE FROM stats_history WHERE timestamp NOT IN (SELECT timestamp FROM stats_history ORDER BY timestamp DESC LIMIT 50)');

        const statsData = {
            cpu: cpuValue,
            ram: ramValue,
            temp: tempValue,
            uptime: Math.round(uptime / 3600),
            totalMem: Math.round(mem.total / (1024 ** 3)),
            disks: disk.map(d => ({
                fs: d.fs,
                used: Math.round(d.use),
                size: Math.round(d.size / (1024 ** 3)),
                mount: d.mount
            }))
        };
        dataCache.stats = statsData;

        // Also refresh history
        const history = await db.all('SELECT * FROM stats_history ORDER BY timestamp ASC');
        dataCache.statsHistory = history;

        return statsData;
    } catch (err) {
        console.error('Stats fetch error:', err);
        return dataCache.stats;
    }
}

async function fetchServices() {
    try {
        const services = await db.all('SELECT * FROM services');
        const servicesWithStatus = await Promise.all(services.map(async (service) => {
            try {
                await axios.get(service.url, { timeout: 3000 });
                return { ...service, status: 'online' };
            } catch (err) {
                return { ...service, status: 'offline' };
            }
        }));
        dataCache.services = servicesWithStatus;
        return servicesWithStatus;
    } catch (err) {
        console.error('Services fetch error:', err);
        return dataCache.services || [];
    }
}

async function fetchDocker() {
    try {
        const containers = await si.dockerContainers();
        const data = containers.map(c => {
            // Extract compose project from labels if available
            let project = 'Standalone';
            if (c.labels) {
                const projectLabel = c.labels.find(l => l.startsWith('com.docker.compose.project='));
                if (projectLabel) {
                    project = projectLabel.replace('com.docker.compose.project=', '');
                }
            }
            return {
                id: c.id,
                name: c.name,
                image: c.image,
                state: c.state,
                status: c.status,
                project
            };
        });
        dataCache.docker = data;
        return data;
    } catch (err) {
        console.error('Docker fetch error:', err);
        return dataCache.docker || [];
    }
}

async function fetchWeather() {
    try {
        const cityRow = await db.get('SELECT value FROM settings WHERE key = ?', 'weather_city');
        const city = cityRow ? cityRow.value : 'Toulouse';

        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            return dataCache.weather;
        }

        const { latitude, longitude, name: cityName } = geoData.results[0];
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherRes.json();

        if (!weatherData.current_weather) {
            return dataCache.weather;
        }

        const current = weatherData.current_weather;
        const code = current.weathercode;
        let condition = 'Cloudy';

        if (code === 0) condition = 'Clear';
        else if (code === 1) condition = 'Mainly Clear';
        else if (code === 2) condition = 'Partly Cloudy';
        else if (code === 3) condition = 'Overcast';
        else if ([45, 48].includes(code)) condition = 'Foggy';
        else if ([51, 53, 55, 56, 57].includes(code)) condition = 'Drizzle';
        else if ([61, 63, 65, 66, 67].includes(code)) condition = 'Rainy';
        else if ([71, 73, 75, 77].includes(code)) condition = 'Snowy';
        else if ([80, 81, 82].includes(code)) condition = 'Showers';
        else if ([85, 86].includes(code)) condition = 'Snow Showers';
        else if ([95, 96, 99].includes(code)) condition = 'Stormy';

        const result = {
            temp: Math.round(current.temperature),
            condition,
            city: cityName,
            isDay: current.is_day === 1,
            time: current.time
        };
        dataCache.weather = result;
        return result;
    } catch (err) {
        console.error('Weather fetching error:', err);
        return dataCache.weather;
    }
}

async function fetchStatus() {
    try {
        const containers = await si.dockerContainers();
        const mcContainer = containers.find(c => c.name === 'minecraft-server' || c.name === '/minecraft-server');
        const running = mcContainer ? mcContainer.state === 'running' : false;
        
        // Update database setting to reflect actual state
        await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['server_running', running.toString()]);
        
        dataCache.status = { running };
        return { running };
    } catch (err) {
        console.error('Status fetch error:', err);
        return dataCache.status || { running: false };
    }
}

// ─── Database init ──────────────────────────────────────────────────────────

(async () => {
    db = await open({
        filename: path.join(__dirname, 'database.db'),
        driver: sqlite3.Database
    });

    // Graceful migration: add new columns only if they don't exist
    const tableInfo = await db.all("PRAGMA table_info(services)");
    const columns = tableInfo.map(c => c.name);
    if (!columns.includes('category')) {
        await db.exec(`ALTER TABLE services ADD COLUMN category TEXT DEFAULT 'System'`);
    }
    if (!columns.includes('isPinned')) {
        await db.exec(`ALTER TABLE services ADD COLUMN isPinned INTEGER DEFAULT 0`);
    }

    await db.exec(`
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            iconUrl TEXT,
            color TEXT,
            category TEXT DEFAULT 'System',
            isPinned INTEGER DEFAULT 0
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS stats_history (
            timestamp INTEGER PRIMARY KEY,
            cpu INTEGER,
            ram INTEGER
        )
    `);

    // Check if empty and add default services
    const servicesCount = await db.get('SELECT COUNT(*) as count FROM services');
    if (servicesCount.count === 0) {
        const defaultServices = [
            { name: 'CasaOS', url: `https://casa.${DOMAIN}`, description: 'System Management', icon: 'casa', iconUrl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/casaos.svg', color: 'casa', category: 'System' },
            { name: 'Immich', url: `https://immich.${DOMAIN}`, description: 'Photo Backup', icon: 'immich', iconUrl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/immich.svg', color: 'immich', category: 'Media' },
            { name: 'Nextcloud', url: `https://nextcloud.${DOMAIN}`, description: 'File Storage', icon: 'nextcloud', iconUrl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/nextcloud.svg', color: 'nextcloud', category: 'Media' },
            { name: 'Pi-hole', url: `https://pihole.${DOMAIN}`, description: 'Network Ad Blocking', icon: 'pi-hole', iconUrl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/pihole.svg', color: 'pi-hole', category: 'System' },
            { name: 'Vaultwarden', url: `https://vault.${DOMAIN}`, description: 'Password Manager', icon: 'vaultwarden', iconUrl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/vaultwarden.svg', color: 'vaultwarden', category: 'Security' },
            { name: 'Jellyfin', url: `https://jellyfin.${DOMAIN}`, description: 'Media Server', icon: 'jellyfin', iconUrl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/jellyfin.svg', color: 'jellyfin', category: 'Media' },
            { name: 'Minecraft', url: `https://mc.${DOMAIN}`, description: 'Game Server', icon: 'minecraft', iconUrl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/minecraft.svg', color: 'minecraft', category: 'Media' }
        ];

        for (const s of defaultServices) {
            await db.run(
                'INSERT INTO services (name, url, description, icon, iconUrl, color, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [s.name, s.url, s.description, s.icon, s.iconUrl, s.color, s.category]
            );
        }
    }

    // Default settings
    const settingsCount = await db.get('SELECT COUNT(*) as count FROM settings');
    if (settingsCount.count === 0) {
        const defaultSettings = [
            { key: 'weather_city', value: 'Toulouse' },
            { key: 'dashboard_title', value: 'Home Dashboard' },
            { key: 'ip_address', value: DEFAULT_IP },
            { key: 'server_running', value: 'false' },
            { key: 'theme', value: 'dark' }
        ];
        for (const s of defaultSettings) {
            await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [s.key, s.value]);
        }
    }

    // Initialize log buffer and data cache
    dataCache.logs = { logs: logBuffer };

    // ─── Start WebSocket push intervals ──────────────────────────────────────
    // Stats: every 5s
    setInterval(async () => {
        const stats = await fetchStats();
        if (stats) {
            broadcast('stats', stats);
            broadcast('statsHistory', dataCache.statsHistory);
        }
    }, 5000);

    // Docker: every 15s
    setInterval(async () => {
        const docker = await fetchDocker();
        broadcast('docker', docker);
    }, 15000);

    // Services health check: every 30s (was 15s via polling — reduced since WS pushes)
    setInterval(async () => {
        const services = await fetchServices();
        broadcast('services', services);
    }, 30000);

    // Weather: every 10 mins
    setInterval(async () => {
        const weather = await fetchWeather();
        if (weather) broadcast('weather', weather);
    }, 600000);

    // MC Status: every 3s
    setInterval(async () => {
        const status = await fetchStatus();
        broadcast('status', status);
    }, 3000);

    // Pre-fetch all data once on startup
    await Promise.all([
        fetchStats(),
        fetchDocker(),
        fetchServices(),
        fetchWeather(),
        fetchStatus(),
    ]);

    console.log('✓ Initial data cache populated');
})();

// ─── REST API routes (kept for mutations & fallback) ─────────────────────────

app.get('/api/services', async (req, res) => {
    try {
        if (dataCache.services) return res.json(dataCache.services);
        const services = await fetchServices();
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/services', async (req, res) => {
    const { name, url, description, icon, iconUrl, color, category, isPinned } = req.body;
    try {
        await db.run(
            'INSERT INTO services (name, url, description, icon, iconUrl, color, category, isPinned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, url, description, icon, iconUrl, color, category || 'System', isPinned ? 1 : 0]
        );
        const newService = await db.get('SELECT * FROM services ORDER BY id DESC LIMIT 1');
        res.status(201).json(newService);
        // Push updated services list to all clients
        const services = await fetchServices();
        broadcast('services', services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/services/:id', async (req, res) => {
    const { name, url, description, icon, iconUrl, color, category, isPinned } = req.body;
    try {
        const fields = [];
        const values = [];
        if (name !== undefined) { fields.push('name = ?'); values.push(name); }
        if (url !== undefined) { fields.push('url = ?'); values.push(url); }
        if (description !== undefined) { fields.push('description = ?'); values.push(description); }
        if (icon !== undefined) { fields.push('icon = ?'); values.push(icon); }
        if (iconUrl !== undefined) { fields.push('iconUrl = ?'); values.push(iconUrl); }
        if (color !== undefined) { fields.push('color = ?'); values.push(color); }
        if (category !== undefined) { fields.push('category = ?'); values.push(category); }
        if (isPinned !== undefined) { fields.push('isPinned = ?'); values.push(isPinned ? 1 : 0); }

        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

        values.push(req.params.id);
        await db.run(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`, values);
        res.json({ success: true });
        const services = await fetchServices();
        broadcast('services', services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM services WHERE id = ?', req.params.id);
        res.json({ success: true });
        // Push updated services list
        const services = await fetchServices();
        broadcast('services', services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/settings', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM settings');
        const settings = {};
        rows.forEach(r => settings[r.key] = r.value);
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/settings', async (req, res) => {
    const settings = req.body;
    try {
        for (const [key, value] of Object.entries(settings)) {
            await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
        }
        res.json({ success: true });
        // If weather_city changed, re-fetch weather
        if (settings.weather_city) {
            const weather = await fetchWeather();
            if (weather) broadcast('weather', weather);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        if (dataCache.stats) return res.json(dataCache.stats);
        const stats = await fetchStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats/history', async (req, res) => {
    try {
        if (dataCache.statsHistory) return res.json(dataCache.statsHistory);
        const history = await db.all('SELECT * FROM stats_history ORDER BY timestamp ASC');
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/docker', async (req, res) => {
    try {
        if (dataCache.docker) return res.json(dataCache.docker);
        const docker = await fetchDocker();
        res.json(docker);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/docker/control', async (req, res) => {
    const { id, action } = req.body;
    if (!['start', 'stop', 'restart'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
    }
    try {
        const { exec } = require('child_process');
        exec(`docker ${action} ${id}`, async (error) => {
            if (error) return res.status(500).json({ error: error.message });
            res.json({ success: true });
            // Push updated docker data
            const docker = await fetchDocker();
            broadcast('docker', docker);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/weather', async (req, res) => {
    try {
        if (dataCache.weather) return res.json(dataCache.weather);
        const weather = await fetchWeather();
        res.json(weather || { error: 'Weather not available' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Minecraft status endpoints
app.get('/api/status', async (req, res) => {
    try {
        if (dataCache.status) return res.json(dataCache.status);
        const status = await fetchStatus();
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/toggle', async (req, res) => {
    try {
        const { exec } = require('child_process');
        const mcDir = '/home/user/minecraft-server';
        
        // Get current state first
        const status = await fetchStatus();
        const currentState = status.running;
        const action = currentState ? 'down' : 'up -d';
        
        addLog('INFO', `${currentState ? 'Stopping' : 'Starting'} Minecraft server...`);
        
        exec(`docker compose -f ${path.join(mcDir, 'docker-compose.yml')} ${action}`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Exec error: ${error}`);
                addLog('ERROR', `Failed to ${currentState ? 'stop' : 'start'} MC: ${error.message}`);
                return res.status(500).json({ error: error.message });
            }
            
            // Wait a bit for status to update
            setTimeout(async () => {
                const newStatus = await fetchStatus();
                broadcast('status', newStatus);
                addLog('SUCCESS', `Minecraft server is now ${newStatus.running ? 'online' : 'offline'}`);
            }, 2000);

            res.json({ success: true, running: !currentState });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/logs', (req, res) => res.json({ logs: logBuffer }));

app.post('/api/logs/clear', (req, res) => {
    logBuffer = [];
    dataCache.logs = { logs: [] };
    broadcast('logs', { logs: [] });
    res.json({ success: true });
});

app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
});

// ─── HTTP + WebSocket Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`WS client connected (${clients.size} total)`);

    // Send full initial state snapshot to newly connected client
    const snapshot = {
        stats: dataCache.stats,
        statsHistory: dataCache.statsHistory,
        docker: dataCache.docker,
        services: dataCache.services,
        weather: dataCache.weather,
        status: dataCache.status,
        logs: { logs: logBuffer },
    };

    ws.send(JSON.stringify({ channel: 'snapshot', data: snapshot }));

    // Handle client messages (e.g. request-refresh for a channel)
    ws.on('message', async (raw) => {
        try {
            const msg = JSON.parse(raw.toString());
            if (msg.type === 'refresh') {
                switch (msg.channel) {
                    case 'docker': {
                        const data = await fetchDocker();
                        ws.send(JSON.stringify({ channel: 'docker', data }));
                        break;
                    }
                    case 'services': {
                        const data = await fetchServices();
                        ws.send(JSON.stringify({ channel: 'services', data }));
                        break;
                    }
                    case 'stats': {
                        const data = await fetchStats();
                        ws.send(JSON.stringify({ channel: 'stats', data }));
                        if (dataCache.statsHistory) {
                            ws.send(JSON.stringify({ channel: 'statsHistory', data: dataCache.statsHistory }));
                        }
                        break;
                    }
                }
            }
        } catch (e) {
            // ignore malformed messages
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log(`WS client disconnected (${clients.size} total)`);
    });
});

server.listen(PORT, () => {
    console.log(`Server + WebSocket running on port ${PORT}`);
});
