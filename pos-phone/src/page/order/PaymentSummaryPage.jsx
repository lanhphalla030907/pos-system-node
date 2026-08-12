// pages/PaymentSummaryPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { formatCurrency } from '../../util/orderHelper';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  FiDollarSign,
  FiCreditCard,
  FiSmartphone,
  FiRefreshCw,
  FiPieChart,
  FiBarChart2,
  FiCalendar,
  FiFilter,
  FiX,
} from 'react-icons/fi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const PaymentSummaryPage = () => {
  const { paymentSummary, loading, loadPaymentSummary } = useDashboard();

  const [period, setPeriod] = useState('today');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadPaymentSummary({ period });
    }
  }, []);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      loadPaymentSummary({ period: newPeriod });
    }
  };

  const handleCustomDateSearch = () => {
    if (dateFrom && dateTo) {
      loadPaymentSummary({
        period: 'custom',
        date_from: dateFrom,
        date_to: dateTo,
      });
    } else {
      alert('Please select both from and to dates');
    }
  };

  const getPeriodLabel = (period) => {
    const labels = {
      today: 'Today',
      yesterday: 'Yesterday',
      week: 'This Week',
      month: 'This Month',
      year: 'This Year',
      custom: 'Custom Range',
    };
    return labels[period] || period;
  };

  // Get icon for payment type
  const getPaymentIcon = (type) => {
    switch (type) {
      case 'mobile bank':
        return <FiSmartphone className="w-4 h-4" />;
      case 'card':
        return <FiCreditCard className="w-4 h-4" />;
      case 'cash':
        return <FiDollarSign className="w-4 h-4" />;
      default:
        return <FiCreditCard className="w-4 h-4" />;
    }
  };

  // Get color for payment type
  const getPaymentColor = (type) => {
    switch (type) {
      case 'mobile bank':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'card':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'cash':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Prepare chart data
  const chartData = {
    labels: paymentSummary?.methods?.map(item => item.name) || [],
    datasets: [
      {
        label: 'Payment Amount',
        data: paymentSummary?.methods?.map(item => item.amount) || [],
        backgroundColor: [
          'rgba(26, 26, 26, 0.8)',
          'rgba(5, 150, 105, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(14, 165, 233, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(34, 197, 94, 0.7)',
        ],
        borderColor: [
          '#1a1a1a',
          '#059669',
          '#3b82f6',
          '#8b5cf6',
          '#ef4444',
          '#eab308',
          '#ec4899',
          '#0ea5e9',
          '#a855f7',
          '#22c55e',
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
            weight: '500',
          },
          color: '#6b7280',
        },
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1a1a1a',
        bodyColor: '#1a1a1a',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 14,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.04)',
          drawBorder: false,
        },
        ticks: {
          callback: function(value) {
            if (value === 0) return '$0';
            if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'k';
            return '$' + value.toLocaleString();
          },
          font: { size: 11 },
          color: '#9ca3af',
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: '#9ca3af',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
            weight: '500',
          },
          color: '#6b7280',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                  <FiDollarSign className="w-5 h-5 text-white" />
                </div>
                Payment Summary
              </h1>
              <p className="text-sm text-gray-500 mt-1 ml-14">
                Payment method performance and analytics
              </p>
            </div>
            <button
              onClick={() => loadPaymentSummary({ period })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
              disabled={loading}
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Period Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Period:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['today', 'yesterday', 'week', 'month', 'year', 'custom'].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    period === p
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {getPeriodLabel(p)}
                </button>
              ))}
            </div>
            {showCustomDate && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
                />
                <span className="text-sm text-gray-400">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
                />
                <button
                  onClick={handleCustomDateSearch}
                  className="px-4 py-1.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && !paymentSummary ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 mt-4">Loading payment summary...</p>
          </div>
        ) : paymentSummary ? (
          <>
            {/* Summary Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Payments</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(paymentSummary.total)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Period: {getPeriodLabel(paymentSummary.period || period)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  {paymentSummary.methods?.slice(0, 4).map((method) => (
                    <div key={method.payment_method_id} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                      <span className={`p-1.5 rounded-lg ${getPaymentColor(method.type)}`}>
                        {getPaymentIcon(method.type)}
                      </span>
                      <div>
                        <p className="text-xs font-medium text-gray-700">{method.name}</p>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(method.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FiBarChart2 className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-800">Payment Distribution</h3>
                </div>
                <div className="h-72">
                  {paymentSummary.methods?.length > 0 ? (
                    <Bar data={chartData} options={chartOptions} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <FiBarChart2 className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-sm font-medium">No payment data available</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FiPieChart className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-800">Payment Share</h3>
                </div>
                <div className="h-72">
                  {paymentSummary.methods?.length > 0 ? (
                    <Doughnut
                      data={{
                        labels: paymentSummary.methods.map(item => item.name),
                        datasets: [
                          {
                            data: paymentSummary.methods.map(item => item.amount),
                            backgroundColor: [
                              'rgba(26, 26, 26, 0.8)',
                              'rgba(5, 150, 105, 0.7)',
                              'rgba(59, 130, 246, 0.7)',
                              'rgba(139, 92, 246, 0.7)',
                              'rgba(239, 68, 68, 0.7)',
                            ],
                            borderColor: [
                              '#1a1a1a',
                              '#059669',
                              '#3b82f6',
                              '#8b5cf6',
                              '#ef4444',
                            ],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={doughnutOptions}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <FiPieChart className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-sm font-medium">No payment data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Methods Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-sm font-semibold text-gray-800">Payment Methods Breakdown</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paymentSummary.methods?.map((method, index) => {
                      const percentage = paymentSummary.total > 0 
                        ? ((method.amount / paymentSummary.total) * 100).toFixed(1) 
                        : 0;
                      return (
                        <tr key={method.payment_method_id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-400">#{index + 1}</span>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className={`p-2 rounded-lg ${getPaymentColor(method.type)}`}>
                                {getPaymentIcon(method.type)}
                              </span>
                              <span className="text-sm font-medium text-gray-800">{method.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2.5 py-1 text-xs font-medium border rounded-full ${getPaymentColor(method.type)}`}>
                              {method.type || 'Other'}
                            </span>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-right">
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(method.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gray-900 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-sm font-bold text-gray-800">Total</td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(paymentSummary.total)}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
            <FiDollarSign className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No payment data available</p>
            <p className="text-sm text-gray-400 mt-1">Try changing the period or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSummaryPage;