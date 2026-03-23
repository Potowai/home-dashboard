import { Power, Loader2 } from 'lucide-react';

interface PowerButtonProps {
  isRunning: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export function PowerButton({ isRunning, isLoading, onToggle }: PowerButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`relative group w-48 h-48 rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-500 ${isRunning ? 'text-red-color border-8 border-red-dim hover:border-red-color/20 bg-red-dim/20' : 'text-accent-color border-8 border-accent-dim hover:border-accent-color/20 bg-accent-dim/20'} ${isLoading ? 'cursor-wait rotate-180 opacity-50' : 'hover:scale-105 active:scale-95'}`}
    >
      <div className={`absolute inset-0 rounded-full border-2 border-white/5 group-hover:scale-110 transition-transform duration-700`} />
      
      {isLoading ? (
        <Loader2 size={64} className="animate-spin opacity-50" />
      ) : (
        <Power size={64} strokeWidth={2.5} className="group-hover:drop-shadow-[0_0_15px_currentColor] transition-all" />
      )}
      
      <span className="text-sm font-black uppercase tracking-[0.4em] mt-2">
        {isLoading ? 'Processing' : isRunning ? 'Terminate' : 'Initialize'}
      </span>
    </button>
  );
}
