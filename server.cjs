const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors = require('cors');
const path = require('path');
const si = require('systeminformation');

const app = express();
app.use(express.json());
app.use(cors());

let db;

(async () => {
    db = await open({
        filename: path.join(__dirname, 'database.db'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            iconUrl TEXT,
            color TEXT
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    `);

    // Check if empty and add default services
    const servicesCount = await db.get('SELECT COUNT(*) as count FROM services');
    if (servicesCount.count === 0) {
        const defaultServices = [
            { name: 'CasaOS', url: 'https://casa.potowai.cloud', description: 'System Management', icon: 'casa', iconUrl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/casaos.svg', color: 'casa' },
            { name: 'Immich', url: 'https://immich.potowai.cloud', description: 'Photo Backup', icon: 'immich', iconUrl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/immich.svg', color: 'immich' },
            { name: 'Nextcloud', url: 'https://nextcloud.potowai.cloud', description: 'File Storage', icon: 'nextcloud', iconUrl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/nextcloud.svg', color: 'nextcloud' },
            { name: 'Minecraft', url: 'https://mc.potowai.cloud', description: 'Game Server', icon: 'mc', iconUrl: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/minecraft.svg', color: 'mc' }
        ];

        for (const s of defaultServices) {
            await db.run(
                'INSERT INTO services (name, url, description, icon, iconUrl, color) VALUES (?, ?, ?, ?, ?, ?)',
                [s.name, s.url, s.description, s.icon, s.iconUrl, s.color]
            );
        }
    }

    // Default settings
    const settingsCount = await db.get('SELECT COUNT(*) as count FROM settings');
    if (settingsCount.count === 0) {
        const defaultSettings = [
            { key: 'weather_city', value: 'Toulouse' },
            { key: 'dashboard_title', value: 'Home Dashboard' },
            { key: 'ip_address', value: '192.168.1.138' }
        ];
        for (const s of defaultSettings) {
            await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [s.key, s.value]);
        }
    }
})();

app.get('/api/services', async (req, res) => {
    try {
        const services = await db.all('SELECT * FROM services');
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/services', async (req, res) => {
    const { name, url, description, icon, iconUrl, color } = req.body;
    try {
        await db.run(
            'INSERT INTO services (name, url, description, icon, iconUrl, color) VALUES (?, ?, ?, ?, ?, ?)',
            [name, url, description, icon, iconUrl, color]
        );
        const newService = await db.get('SELECT * FROM services ORDER BY id DESC LIMIT 1');
        res.status(201).json(newService);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM services WHERE id = ?', req.params.id);
        res.json({ success: true });
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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const cpu = await si.currentLoad();
        const mem = await si.mem();
        const uptime = si.time().uptime;
        
        res.json({
            cpu: Math.round(cpu.currentLoad),
            ram: Math.round((mem.active / mem.total) * 100),
            uptime: Math.round(uptime / 3600), // hours
            totalMem: Math.round(mem.total / (1024 ** 3)) // GB
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/weather', async (req, res) => {
    try {
        const cityRow = await db.get('SELECT value FROM settings WHERE key = ?', 'weather_city');
        const city = cityRow ? cityRow.value : 'Toulouse';
        
        // Mock weather response
        const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'];
        const random = Math.floor(Math.random() * conditions.length);
        res.json({
            temp: 22 + Math.floor(Math.random() * 5),
            condition: conditions[random],
            city: city 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mock other endpoints
app.get('/api/status', (req, res) => res.json({ running: true }));
app.post('/api/toggle', (req, res) => res.json({ success: true, running: true }));
app.get('/api/logs', (req, res) => res.json({ logs: [] }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
