import { X } from 'lucide-react';
import type { Service } from '../types';
import { ServiceIcon } from './ServiceIcon';

interface ServiceCardProps {
  service: Service;
  isEditMode?: boolean;
  onDelete?: (id: number) => void;
  onClick?: () => void;
}

export function ServiceCard({ service, isEditMode, onDelete, onClick }: ServiceCardProps) {
  const status = service.status ?? 'offline';

  const handleClick = () => {
    if (isEditMode) return;
    if (onClick) {
      onClick();
    } else {
      window.open(service.url, '_blank', 'noopener');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`service-card ${isEditMode ? 'edit-mode' : ''}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {isEditMode && onDelete && service.id && (
        <button
          className="edit-badge"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(service.id!);
          }}
          title="Remove service"
        >
          <X size={10} />
        </button>
      )}

      <div className="relative">
        <ServiceIcon service={service} size={28} />
        <span
          className={`status-dot absolute -top-1 -right-1 ${status === 'online' ? 'online' : 'offline'}`}
        />
      </div>

      <span className="text-xs font-medium text-center leading-tight" style={{ color: 'var(--text-primary)' }}>
        {service.name}
      </span>
    </div>
  );
}
