import { Home, Server } from 'lucide-react';

interface HeaderProps {
  ip: string;
  title?: string;
}

export function Header({ ip, title }: HeaderProps) {
  const renderTitle = () => {
    if (!title) return <span className="logo-text">Home <span>Dashboard</span></span>;
    const parts = title.split(' ');
    if (parts.length > 1) {
      return (
        <span className="logo-text">
          {parts[0]} <span>{parts.slice(1).join(' ')}</span>
        </span>
      );
    }
    return <span className="logo-text"><span>{title}</span></span>;
  };

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-mark">
          <Home size={26} />
        </div>
        {renderTitle()}
      </div>
      <div className="server-badge">
        <Server size={14} />
        <span>{ip}</span>
      </div>
    </header>
  );
}
