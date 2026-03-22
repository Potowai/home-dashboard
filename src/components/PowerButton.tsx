import { Power, Play, Square } from 'lucide-react';

interface PowerButtonProps {
  isRunning: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export function PowerButton({ isRunning, isLoading, onToggle }: PowerButtonProps) {
  return (
    <button
      className={`power-button ${isRunning ? 'stop' : 'start'}`}
      onClick={onToggle}
      disabled={isLoading}
      aria-label={isRunning ? 'Stop server' : 'Start server'}
    >
      {isRunning ? <Square size={48} /> : <Play size={48} />}
      <span>{isLoading ? '...' : isRunning ? 'STOP' : 'START'}</span>
    </button>
  );
}
