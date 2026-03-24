import { Globe, Shield, Server, Tv, Image, Cloud, Gauge, Box, Download, Lock, Headphones, Monitor } from 'lucide-react';
import type { Service } from '../types';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'jellyfin': Tv,
  'immich': Image,
  'nextcloud': Cloud,
  'casaos': Server,
  'pi-hole': Shield,
  'vaultwarden': Lock,
  'audiobookshelf': Headphones,
  'uptime-kuma': Gauge,
  'dozzle': Box,
  'homepage': Monitor,
  'minecraft': Globe,
  'caddy': Download,
  'generic': Globe,
};

interface ServiceIconProps {
  service: Service;
  size?: number;
}

export function ServiceIcon({ service, size = 28 }: ServiceIconProps) {
  const IconComponent = iconMap[service.icon] ?? Globe;

  if (service.iconUrl) {
    return (
      <img
        src={service.iconUrl}
        alt={service.name}
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  return <IconComponent size={size} className="flex-shrink-0" />;
}
