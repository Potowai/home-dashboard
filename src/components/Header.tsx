import { Home, Server } from 'lucide-react';
import type { Service } from '../types';

interface HeaderProps {
  ip: string;
}

export function Header({ ip }: HeaderProps) {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-mark">
          <Home size={26} />
        </div>
        <span className="logo-text">Home<span>OS</span></span>
      </div>
      <div className="server-badge">
        <Server size={14} />
        <span>{ip}</span>
      </div>
    </header>
  );
}
