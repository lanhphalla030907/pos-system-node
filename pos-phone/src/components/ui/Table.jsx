// components/product/Table.jsx
import React from "react";

const Table = ({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = "No data found",
  className = "",
  striped = true,
  hoverable = true,
  bordered = false,
  compact = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📂</div>
        <p className="text-lg font-medium text-gray-600">{emptyMessage}</p>
        <p className="text-sm text-gray-400 mt-1">Start by adding your first entry</p>
      </div>
    );
  }

  const tableClassName = `
    min-w-full 
    ${bordered ? 'border border-gray-200' : ''}
    ${className}
  `;

  const getRowClassName = (index) => {
    let classes = 'transition-colors duration-150';
    if (striped && index % 2 === 0) {
      classes += ' bg-white';
    } else if (striped) {
      classes += ' bg-gray-50/30';
    } else {
      classes += ' bg-white';
    }
    if (hoverable) {
      classes += ' hover:bg-primary-50';
    }
    if (bordered) {
      classes += ' border-b border-gray-200';
    }
    return classes;
  };

  const getCellPadding = () => {
    return compact ? 'px-4 py-2' : 'px-6 py-4';
  };

  return (
    <div className="overflow-x-auto">
      <table className={tableClassName}>
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${getCellPadding()} text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                style={{ width: col.width || 'auto' }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className={getRowClassName(index)}
            >
              {columns.map((col) => (
                <td key={col.key} className={`${getCellPadding()} text-sm text-gray-700`}>
                  {col.render ? col.render(row, index) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;