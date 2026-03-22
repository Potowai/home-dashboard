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
}

export function ServiceCard({ service, onDelete }: ServiceCardProps) {
  const Icon = iconMap[service.icon as keyof typeof iconMap] || Home;
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (service.id && onDelete) {
      onDelete(service.id);
    }
  };

  return (
    <div className="service-card-wrapper">
      <a href={service.url} className="service-link" target="_blank" rel="noopener noreferrer">
        <div className={`service-icon ${service.color}`}>
          {service.iconUrl ? (
            <img src={service.iconUrl} alt={service.name} className="real-icon" />
          ) : (
            <Icon size={20} />
          )}
        </div>
        <div className="service-info">
          <span className="service-name">{service.name}</span>
          <span className="service-desc">{service.description}</span>
        </div>
        <div className="service-actions">
          <ExternalLink size={16} className="service-arrow" />
          {service.id && (
            <button className="delete-service-btn" onClick={handleDelete} title="Delete Service">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </a>
    </div>
  );
}
