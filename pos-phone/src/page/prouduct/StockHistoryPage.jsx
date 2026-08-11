// pages/StockHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useStock } from '../../hooks/useStock';
import ProductPagination from '../../components/product/ProductPagination';
import { formatCurrency, formatDate } from '../../util/orderHelper';

const StockHistoryPage = () => {
  const { stockHistory, loading, pagination, loadStockHistory } = useStock();

  const [filter, setFilter] = useState({
    product_id: '',
    type: '',
    from: '',
    to: '',
    page: 1,
    limit: 10,
  });

  // Load stock history when filter changes
  useEffect(() => {
    loadStockHistory(filter);
  }, [filter, loadStockHistory]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : (key === 'limit' || key === 'search' ? 1 : prev.page),
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilter({
      product_id: '',
      type: '',
      from: '',
      to: '',
      page: 1,
      limit: 10,
    });
  };

  // Get movement type badge
  const getTypeBadge = (type) => {
    if (type === 'in') {
      return { label: 'Stock In', color: 'bg-green-100 text-green-800' };
    }
    return { label: 'Stock Out', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Stock History</h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? 'Loading...' : `${pagination?.total || 0} records found`}
            </p>
          </div>
          <button
            onClick={() => loadStockHistory(filter)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-sm flex items-center gap-2"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Movement Type
              </label>
              <select
                value={filter.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">All Types</option>
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filter.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filter.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Items per page
              </label>
              <select
                value={filter.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              {(filter.type || filter.from || filter.to) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline underline-offset-2 transition"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
            </div>
          ) : stockHistory.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-lg">No stock history found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockHistory.map((item) => {
                    const type = getTypeBadge(item.movement_type);
                    return (
                      <tr key={item.detail_id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.movement_date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                            {item.barcode && (
                              <p className="text-xs text-gray-400">{item.barcode}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type.color}`}>
                            {type.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                          {item.qty}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          {formatCurrency(item.unit_cost)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <span className="text-blue-600 font-medium">{item.reference_no}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <ProductPagination
          currentPage={pagination?.currentPage || 1}
          totalPages={pagination?.totalPages || 1}
          totalItems={pagination?.total || stockHistory.length}
          limit={pagination?.limit || filter.limit || 10}
          onPageChange={(page) => handleFilterChange('page', page)}
        />
      </div>
    </div>
  );
};

export default StockHistoryPage;