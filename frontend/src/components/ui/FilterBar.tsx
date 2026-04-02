import { ChangeEvent } from 'react';

type FilterBarProps = {
  filters: { key: string; label: string; value: string | number; options?: Array<{ value: string | number; label: string }>; type?: 'text' | 'select' }[];
  onChange: (key: string, value: string | number) => void;
  onReset: () => void;
};

export default function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  return (
    <div className="filter-bar">
      {filters.map((filter) => (
        <div key={filter.key} className="filter-item">
          <label>{filter.label}</label>
          {filter.type === 'select' ? (
            <select value={filter.value} onChange={(e) => onChange(filter.key, e.target.value)}>
              <option value="">Todos</option>
              {filter.options?.map((opt) => (
                <option key={`${filter.key}-${opt.value}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={filter.value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(filter.key, e.target.value)}
            />
          )}
        </div>
      ))}
      <button type="button" onClick={onReset} className="btn-secondary">
        Limpiar
      </button>
    </div>
  );
}
