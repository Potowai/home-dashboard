import { ExternalLink } from 'lucide-react';
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
}

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = iconMap[service.icon as keyof typeof iconMap] || Home;
  
  return (
    <a href={service.url} className="service-link" target="_blank" rel="noopener noreferrer">
      <div className={`service-icon ${service.color}`}>
        <Icon size={20} />
      </div>
      <div className="service-info">
        <span className="service-name">{service.name}</span>
        <span className="service-desc">{service.description}</span>
      </div>
      <ExternalLink size={16} className="service-arrow" />
    </a>
  );
}
