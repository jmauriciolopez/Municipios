import { ReactNode } from 'react';

type DataTableColumn<T> = {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
};

export default function DataTable<T>({ columns, data, onRowClick, emptyMessage }: DataTableProps<T>) {
  if (!data.length) {
    return <div className="card-premium animate-fade-in py-12 text-center text-slate-400 font-medium italic">{emptyMessage || 'No hay datos disponibles'}</div>;
  }

  return (
    <div className="data-table-container animate-fade-in overflow-hidden border border-slate-200/60 transition-shadow hover:shadow-md">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="bg-slate-50/50 py-3.5 text-slate-500 font-semibold tracking-wide uppercase text-[10px]">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item, index) => (
            <tr 
              key={`row-${index}`} 
              onClick={() => onRowClick?.(item)} 
              className={onRowClick ? 'cursor-pointer hover:bg-slate-50/80 transition-colors' : ''}
            >
              {columns.map((column) => (
                <td key={String(column.key)} className="py-4 text-sm text-slate-600">
                  {column.render ? column.render(item) : String((item as Record<string, any>)[column.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

