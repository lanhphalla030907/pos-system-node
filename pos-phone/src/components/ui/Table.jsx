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
  mobileCardRender = null,
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

  const renderMobileCard = (row, index) => {
    if (mobileCardRender) {
      return mobileCardRender(row, index);
    }

    const visibleColumns = columns.filter(col => col.mobile !== false);
    const primaryCol = visibleColumns.find(col => col.mobilePrimary) || visibleColumns[0];
    const secondaryCols = visibleColumns.filter(col => col !== primaryCol);
    const actionsCol = columns.find(col => col.key === 'actions' || col.key === 'action');

    return (
      <div className="p-4 hover:bg-gray-50/80 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {primaryCol && (
              <div className="font-medium text-gray-900 text-sm truncate">
                {primaryCol.render ? primaryCol.render(row, index) : row[primaryCol.key]}
              </div>
            )}
            <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {secondaryCols.filter(col => col.key !== 'actions' && col.key !== 'action').slice(0, 6).map(col => (
                <div key={col.key} className={col.mobileFull ? 'col-span-2' : ''}>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{col.title}</p>
                  <div className="text-xs text-gray-600 truncate">
                    {col.render ? col.render(row, index) : row[col.key] || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {actionsCol && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {actionsCol.render ? actionsCol.render(row, index) : null}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="md:hidden divide-y divide-gray-100">
        {data.map((row, index) => (
          <div key={row.id || index}>
            {renderMobileCard(row, index)}
          </div>
        ))}
      </div>
      <div className="hidden md:block">
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
    </div>
  );
};

export default Table;
