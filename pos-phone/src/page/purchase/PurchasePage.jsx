// pages/PurchasePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { usePurchase } from '../../hooks/usePurchase';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../util/orderHelper';
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiX,
  FiEye,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiDollarSign,
  FiCreditCard,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiFilter,
} from 'react-icons/fi';

const PurchasePage = () => {
  const {
    purchases,
    loading,
    pagination,
    summary,
    loadPurchases,
    loadSummary,
  } = usePurchase();

  const [filter, setFilter] = useState({
    search: '',
    status: '',
    supplier_id: '',
    payment_method: '',
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  const hasLoaded = useRef(false);

  useEffect(() => {
    loadPurchases(filter);
  }, [filter, loadPurchases]);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadSummary();
    }
  }, [loadSummary]);

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1,
    }));
  };

  const clearFilters = () => {
    setFilter({
      search: '',
      status: '',
      supplier_id: '',
      payment_method: '',
      page: 1,
      limit: 10,
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: FiCheckCircle },
      pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: FiAlertCircle },
      cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', icon: FiXCircle },
    };
    return statusMap[status] || statusMap.pending;
  };

  const getPaymentBadge = (method) => {
    const methods = {
      cash: { label: 'Cash', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      bank_transfer: { label: 'Bank Transfer', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      credit_card: { label: 'Credit Card', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      cheque: { label: 'Cheque', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    };
    return methods[method?.toLowerCase()] || { label: method || 'N/A', color: 'bg-gray-50 text-gray-600 border-gray-200' };
  };

  const getPaymentStatus = (paid, total) => {
    const paidNum = parseFloat(paid) || 0;
    const totalNum = parseFloat(total) || 0;

    if (paidNum >= totalNum && totalNum > 0) {
      return { label: 'Paid', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    } else if (paidNum > 0 && paidNum < totalNum) {
      return { label: 'Partial', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    } else {
      return { label: 'Unpaid', color: 'bg-red-50 text-red-700 border-red-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
              Purchase Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? 'Loading...' : `${pagination?.total || 0} purchases found`}
            </p>
          </div>
          <Link
            to="/purchases/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-all shadow-sm text-sm font-medium"
          >
            <FiPlus className="w-4 h-4" />
            Add Purchase
          </Link>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">{summary.total_purchase || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  <FiPackage className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Amount</p>
                  <p className="text-2xl font-semibold text-black mt-1">{formatCurrency(summary.total_amount)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-black/5 flex items-center justify-center text-black">
                  <FiDollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Paid</p>
                  <p className="text-2xl font-semibold text-emerald-600 mt-1">{formatCurrency(summary.total_paid)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Remaining</p>
                  <p className="text-2xl font-semibold text-red-600 mt-1">{formatCurrency(summary.total_remaining)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                  <FiAlertCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by purchase no..."
                value={filter.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
              />
              {filter.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600"
            >
              <FiFilter className="w-4 h-4" />
              Filters
              {(filter.status || filter.payment_method) && (
                <span className="w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                  {(filter.status ? 1 : 0) + (filter.payment_method ? 1 : 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => loadPurchases(filter)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Status
                </label>
                <select
                  value={filter.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={filter.payment_method}
                  onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear filters
                </button>
                {(filter.status || filter.payment_method) && (
                  <span className="text-xs text-gray-400 self-center">
                    Active filters applied
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
              <p className="text-sm text-gray-500 mt-3">Loading purchases...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-16">
              <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No purchases found</p>
              <p className="text-sm text-gray-400 mt-1">
                {filter.search || filter.status || filter.payment_method ? 'Try adjusting your filters' : 'Start by adding a purchase'}
              </p>
              {!filter.search && !filter.status && !filter.payment_method && (
                <Link
                  to="/purchases/add"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-all text-sm font-medium"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Purchase
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {purchases.map((item) => {
                  const status = getStatusBadge(item.status);
                  const StatusIcon = status.icon;
                  const payment = getPaymentBadge(item.payment_method);
                  const paymentStatus = getPaymentStatus(item.paid_amount, item.total_amount);

                  return (
                    <div key={item.id} className="p-4 hover:bg-gray-50/80 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium text-black">{item.purchase_no}</span>
                          <p className="text-xs text-gray-400 mt-0.5">{item.supplier_name || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/purchases/${item.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/purchases/edit/${item.id}`}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium border ${paymentStatus.color}`}>
                          {paymentStatus.label}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium border ${payment.color}`}>
                          {payment.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="font-bold text-gray-800">{formatCurrency(item.total_amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Paid</p>
                          <p className="text-emerald-600 font-medium">{formatCurrency(item.paid_amount)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400">Date</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FiClock className="w-3 h-3 text-gray-400" />
                            {formatDate(item.create_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Payment</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchases.map((item) => {
                      const status = getStatusBadge(item.status);
                      const StatusIcon = status.icon;
                      const payment = getPaymentBadge(item.payment_method);
                      const paymentStatus = getPaymentStatus(item.paid_amount, item.total_amount);

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-medium text-black">
                              {item.purchase_no}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-700">
                              {item.supplier_name || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-800">
                              {formatCurrency(item.total_amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                            <div>
                              <span className="text-sm text-emerald-600 font-medium">
                                {formatCurrency(item.paid_amount)}
                              </span>
                              <span className="text-xs text-gray-400 block">
                                Remaining: {formatCurrency(item.remaining)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-medium border ${paymentStatus.color}`}>
                                {paymentStatus.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${payment.color}`}>
                              {payment.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <FiClock className="w-3.5 h-3.5 text-gray-400" />
                              <span>{formatDate(item.create_at)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                to={`/purchases/${item.id}`}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FiEye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/purchases/edit/${item.id}`}
                                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-gray-500 order-2 sm:order-1">
                    Showing {(pagination.page - 1) * filter.limit + 1} -{' '}
                    {Math.min(pagination.page * filter.limit, pagination.total)} of{' '}
                    {pagination.total} purchases
                  </div>
                  <div className="flex items-center gap-1 order-1 sm:order-2">
                    <button
                      onClick={() => handleFilterChange('page', pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium text-gray-700">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handleFilterChange('page', pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;