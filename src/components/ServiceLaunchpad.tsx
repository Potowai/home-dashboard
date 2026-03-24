import { useState } from 'react';
import { ChevronDown, Pencil, Check } from 'lucide-react';
import type { Service } from '../types';
import { ServiceCard } from './ServiceCard';
import { deleteService } from '../api/dashboard';

const DEFAULT_CATEGORIES = [
  'Media',
  'System',
  'Security',
  'Dev & Network',
];

interface ServiceLaunchpadProps {
  services: Service[];
  isEditMode: boolean;
  onToggleEdit: () => void;
}

function groupServices(services: Service[]): Map<string, Service[]> {
  const groups = new Map<string, Service[]>();

  for (const cat of DEFAULT_CATEGORIES) {
    groups.set(cat, []);
  }

  for (const service of services) {
    const cat = service.category || 'System';
    if (!groups.has(cat)) {
      groups.set(cat, []);
    }
    groups.get(cat)!.push(service);
  }

  // Sort: pinned first, then rest
  for (const [cat, svcs] of groups) {
    groups.set(cat, [
      ...svcs.filter(s => s.isPinned),
      ...svcs.filter(s => !s.isPinned),
    ]);
  }

  return groups;
}

interface CategorySectionProps {
  name: string;
  services: Service[];
  isEditMode: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: (id: number) => void;
}

function CategorySection({ name, services, isEditMode, isOpen, onToggle, onDelete }: CategorySectionProps) {
  if (services.length === 0 && !isEditMode) return null;

  return (
    <div className="mb-6">
      <button
        className="category-header w-full"
        onClick={onToggle}
      >
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          {name}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}
        >
          {services.length}
        </span>
        <ChevronDown
          size={14}
          className={`category-chevron ml-auto ${isOpen ? 'open' : ''}`}
          style={{ color: 'var(--text-secondary)' }}
        />
      </button>

      {isOpen && (
        <div className="fade-in" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingTop: '8px' }}>
          {services.map((service) => (
            <ServiceCard
              key={service.id || service.name}
              service={service}
              isEditMode={isEditMode}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ServiceLaunchpad({ services, isEditMode, onToggleEdit }: ServiceLaunchpadProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(DEFAULT_CATEGORIES));

  const grouped = groupServices(services);

  const toggleCategory = (name: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleDelete = async (id: number) => {
    await deleteService(id);
  };

  return (
    <div className="panel-section h-full flex flex-col">
      {/* Panel Header */}
      <div className="panel-header flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Services</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
          >
            {services.length}
          </span>
        </div>

        <button
          className={`btn-ghost ${isEditMode ? 'active' : ''}`}
          onClick={onToggleEdit}
          style={isEditMode ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
        >
          {isEditMode ? (
            <>
              <Check size={12} />
              Done
            </>
          ) : (
            <>
              <Pencil size={12} />
              Edit
            </>
          )}
        </button>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '16px 20px' }}>
        {[...grouped.entries()].map(([category, svcs]) => (
          <CategorySection
            key={category}
            name={category}
            services={svcs}
            isEditMode={isEditMode}
            isOpen={openCategories.has(category)}
            onToggle={() => toggleCategory(category)}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
