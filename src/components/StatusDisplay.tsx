interface StatusDisplayProps {
  isRunning: boolean;
  isLoading?: boolean;
}

export function StatusDisplay({ isRunning, isLoading }: StatusDisplayProps) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border ${isRunning ? 'bg-accent-dim border-accent-color/30 text-accent-color shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-red-dim border-red-color/30 text-red-color shadow-[0_0_15px_rgba(239,68,68,0.1)]'} ${isLoading ? 'opacity-50 blur-[1px]' : ''} transition-all duration-500`}>
      <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-accent-color animate-pulse' : 'bg-red-color'} ${isLoading ? 'animate-spin' : ''}`} />
      <span className="text-[10px] font-black uppercase tracking-widest">{isRunning ? 'Active' : 'Standby'}</span>
    </div>
  );
}
