import { ExternalLink, Trash2 } from 'lucide-react';
import { Home, Image, Cloud, Gamepad2 } from 'lucide-react';
import type { Service } from '../types';

const iconMap = {
  casa: Home,
  immich: Image,
  nextcloud: Cloud,
  mc: Gamepad2,
};

interface ServiceCardProps {
  service: Service;
  onDelete?: (id: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ServiceCard({ service, onDelete, className, style }: ServiceCardProps) {
  const Icon = iconMap[service.icon as keyof typeof iconMap] || Home;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (service.id && onDelete) {
      onDelete(service.id);
    }
  };

  return (
    <div className={`group relative w-full ${className || ''}`} style={style}>
      <a
        href={service.url}
        className="flex items-stretch h-14 rounded-2xl bg-white/[0.02] border border-white/[0.04] overflow-hidden hover:bg-white/[0.05] hover:border-white/10 hover:-translate-y-0.5 transition-all duration-300 shadow-md group-hover:shadow-black/30"
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* Left colored portion */}
        <div className={`w-16 flex items-center justify-center bg-transparent border-r border-white/10`}>
          {service.iconUrl ? (
            <img src={service.iconUrl} alt={service.name} className="w-6 h-6 object-contain filter drop-shadow opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          ) : (
            <Icon size={20} className="text-white opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          )}
        </div>

        {/* Right text portion */}
        <div className="flex-1 min-w-0 flex items-center justify-between px-4">
          <div className="flex flex-col justify-center min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-color transition-colors truncate">{service.name}</h3>
              {service.status && (
                <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${service.status === 'online' ? 'bg-accent-color shadow-[0_0_5px_var(--accent)]' : 'bg-red-color'}`} />
              )}
            </div>
            {service.description && (
              <p className="text-[10px] text-text-dim truncate">{service.description}</p>
            )}
          </div>

          {/* Actions / Hover Indicator */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
            {service.id && (
              <button
                className="p-1.5 rounded-lg hover:bg-red-dim hover:text-red-color text-text-dim transition-all mr-1"
                onClick={handleDelete}
                title="Delete Service"
              >
                <Trash2 size={13} />
              </button>
            )}
            <ExternalLink size={14} className="text-text-dim group-hover:text-accent-color" />
          </div>
        </div>
      </a>
    </div>
  );
}
