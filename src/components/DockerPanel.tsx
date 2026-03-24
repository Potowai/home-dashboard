import { Box, ChevronDown, Play, Square, RotateCcw, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useWSChannel, useWSSend } from '../hooks/useWebSocket';
import { controlDockerContainer } from '../api/dashboard';

function groupByProject(containers: any[]): Map<string, any[]> {
  const groups = new Map<string, any[]>();
  for (const c of containers) {
    const project = c.project || 'Standalone';
    if (!groups.has(project)) groups.set(project, []);
    groups.get(project)!.push(c);
  }
  return groups;
}

export function DockerPanel() {
  const containers = useWSChannel<any[]>('docker') || [];
  const send = useWSSend();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const grouped = groupByProject(containers);
  const runningCount = containers.filter(c => c.state === 'running').length;

  const handleRefresh = () => {
    send({ type: 'refresh', channel: 'docker' });
  };

  const handleControl = async (id: string, action: 'start' | 'stop' | 'restart') => {
    setLoading(`${id}-${action}`);
    await controlDockerContainer(id, action);
    setLoading(null);
  };

  return (
    <div className="panel-section">
      {/* Header */}
      <div className="panel-header" onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Box size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Containers</span>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '20px',
            background: 'var(--surface-elevated)',
            color: 'var(--text-secondary)',
          }}>
            {runningCount}/{containers.length} running
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
            className="btn-icon"
            title="Refresh"
          >
            <Loader2 size={14} />
          </button>
          <ChevronDown
            size={14}
            style={{
              color: 'var(--text-secondary)',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="fade-in" style={{ padding: '16px 20px' }}>
          {containers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px',
              color: 'var(--text-secondary)',
              fontSize: '13px',
            }}>
              No containers found
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[...grouped.entries()].map(([project, pcs]) => (
                <div key={project}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                  }}>
                    {project}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pcs.map((container) => (
                      <div
                        key={container.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'var(--surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          transition: 'border-color 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {container.name}
                          </span>
                          <span className="mono" style={{
                            fontSize: '10px',
                            color: 'var(--text-secondary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {container.image}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          {/* Status dot */}
                          <span
                            className={`status-dot ${
                              container.state === 'running' ? 'online' :
                              container.state === 'paused' ? 'warning' : 'offline'
                            }`}
                          />

                          {/* Action buttons */}
                          {container.state === 'running' ? (
                            <>
                              <button
                                onClick={() => handleControl(container.id, 'restart')}
                                className="btn-icon"
                                disabled={!!loading}
                                title="Restart"
                              >
                                {loading === `${container.id}-restart`
                                  ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                  : <RotateCcw size={13} />
                                }
                              </button>
                              <button
                                onClick={() => handleControl(container.id, 'stop')}
                                className="btn-icon"
                                disabled={!!loading}
                                title="Stop"
                              >
                                {loading === `${container.id}-stop`
                                  ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                  : <Square size={13} />
                                }
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleControl(container.id, 'start')}
                              className="btn-icon"
                              disabled={!!loading}
                              title="Start"
                            >
                              {loading === `${container.id}-start`
                                ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                : <Play size={13} />
                              }
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
