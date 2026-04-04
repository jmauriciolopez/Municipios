import { ChangeEvent } from 'react';
import { Search, X, ChevronDown, Calendar, SlidersHorizontal } from 'lucide-react';

type FilterOption = { value: string | number; label: string };

type FilterBarProps = {
  filters: { 
    key: string; 
    label: string; 
    value: string | number; 
    options?: FilterOption[]; 
    type?: 'text' | 'select' | 'date'
  }[];
  onChange: (key: string, value: string | number) => void;
  onReset: () => void;
};

export default function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const hasActiveFilters = filters.some(f => f.value !== '' && f.value !== 0 && f.value !== undefined);

  return (
    <div className="flex items-center gap-4 p-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-2 px-3 text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-slate-800 mr-2">
        <SlidersHorizontal size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Filtros</span>
      </div>

      <div className="flex flex-1 items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {filters.map((filter) => (
          <div key={filter.key} className="flex-shrink-0 min-w-[140px]">
            <div className="relative group">
              {filter.type === 'select' ? (
                <>
                  <select 
                    value={filter.value} 
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    className="w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-brand-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer appearance-none outline-none"
                  >
                    <option value="">{filter.label}</option>
                    {filter.options?.map((opt) => (
                      <option key={`${filter.key}-${opt.value}`} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-brand-500 transition-colors" />
                </>
              ) : filter.type === 'date' ? (
                <div className="relative">
                  <input
                    type="date"
                    value={filter.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(filter.key, e.target.value)}
                    className="w-full h-10 pl-9 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-brand-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all appearance-none outline-none [color-scheme:light] dark:[color-scheme:dark]"
                  />
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-brand-500 transition-colors" />
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder={filter.label}
                    value={filter.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(filter.key, e.target.value)}
                    className="w-full h-10 pl-9 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 placeholder:text-slate-400 placeholder:font-medium hover:border-brand-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-brand-500 transition-colors" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasActiveFilters && (
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-3 h-10 bg-slate-200/50 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-600 dark:text-slate-400 hover:text-red-600 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
        >
          <X size={14} />
          Limpiar
        </button>
      )}
    </div>
  );
}
