import { ReactNode } from 'react';

type DataTableColumn<T> = {
  key: keyof T;
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
    return <div className="empty-state">{emptyMessage || 'No data available'}</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={String(column.key)}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={`row-${index}`} onClick={() => onRowClick?.(item)}>
            {columns.map((column) => (
              <td key={String(column.key)}>
                {column.render ? column.render(item) : String(item[column.key] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
