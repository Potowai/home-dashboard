interface StatusDisplayProps {
  isRunning: boolean;
}

export function StatusDisplay({ isRunning }: StatusDisplayProps) {
  return (
    <div className={`status-display ${isRunning ? 'online' : 'offline'}`}>
      <span className="status-dot" />
      <span>{isRunning ? 'Online' : 'Offline'}</span>
    </div>
  );
}
