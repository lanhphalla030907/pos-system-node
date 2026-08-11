// pages/PurchaseReportPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { usePurchase } from '../../hooks/usePurchase';
import { formatCurrency, formatDate } from '../../util/orderHelper';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  FiCalendar,
  FiRefreshCw,
  FiTrendingUp,
  FiDollarSign,
  FiCreditCard,
  FiAlertCircle,
  FiBarChart2,
  FiPieChart,
  FiTrendingDown,
  FiFilter,
  FiX,
} from 'react-icons/fi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const PurchaseReportPage = () => {
  const { report, loading, loadReport } = usePurchase();

  const [filter, setFilter] = useState({
    type: 'daily',
    from: '',
    to: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current || filter.from || filter.to) {
      loadReport(filter);
    }
  }, [filter, loadReport]);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setDate(today.getDate() - 30);
      
      setFilter(prev => ({
        ...prev,
        from: lastMonth.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
      }));
    }
  }, []);

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const getTotals = () => {
    return report.reduce(
      (acc, item) => ({
        total_purchase: acc.total_purchase + (item.total_purchase || 0),
        total_amount: acc.total_amount + (item.total_amount || 0),
        total_paid: acc.total_paid + (item.total_paid || 0),
        total_remaining: acc.total_remaining + (item.total_remaining || 0),
      }),
      { total_purchase: 0, total_amount: 0, total_paid: 0, total_remaining: 0 }
    );
  };

  const totals = getTotals();

  const labels = report.map(item => 
    filter.type === 'daily' 
      ? formatDate(item.date) 
      : item.month
  );

  // Modern Bar Chart Data
  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Total Amount',
        data: report.map(item => item.total_amount || 0),
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      },
      {
        label: 'Total Paid',
        data: report.map(item => item.total_paid || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      },
      {
        label: 'Total Remaining',
        data: report.map(item => item.total_remaining || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };

  // Modern Doughnut Chart Data
  const doughnutData = {
    labels: ['Paid', 'Remaining'],
    datasets: [
      {
        data: [totals.total_paid, totals.total_remaining],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.7)'],
        borderColor: ['#10b981', '#ef4444'],
        borderWidth: 3,
      },
    ],
  };

  // Modern Line Chart Data
  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Number of Purchases',
        data: report.map(item => item.total_purchase || 0),
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(0, 0, 0, 0.1)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.02)');
          return gradient;
        },
        borderColor: '#000000',
        tension: 0.4,
        pointBackgroundColor: '#000000',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  // Modern Chart Options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: '500',
            family: "'Inter', system-ui, sans-serif",
          },
          color: '#6b7280',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          callback: function(value) {
            return '$' + (value / 1000).toFixed(0) + 'k';
          },
          font: {
            size: 11,
            family: "'Inter', system-ui, sans-serif",
          },
          color: '#9ca3af',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', system-ui, sans-serif",
          },
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
          padding: 20,
          font: {
            size: 13,
            weight: '500',
            family: "'Inter', system-ui, sans-serif",
          },
          color: '#6b7280',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: $${context.parsed.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '65%',
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: '500',
            family: "'Inter', system-ui, sans-serif",
          },
          color: '#6b7280',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 11,
            family: "'Inter', system-ui, sans-serif",
          },
          color: '#9ca3af',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', system-ui, sans-serif",
          },
          color: '#9ca3af',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight flex items-center gap-2">
            <FiBarChart2 className="w-6 h-6 text-gray-400" />
            Purchase Report
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading...' : `${report.length} records found`}
          </p>
        </div>
        <button
          onClick={() => loadReport(filter)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
          disabled={loading}
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 w-full sm:w-auto"
            >
              <FiFilter className="w-4 h-4" />
              Filters
              {(filter.from || filter.to) && (
                <span className="w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>
          <div className="flex-1">
            <select
              value={filter.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
            >
              <option value="daily">Daily Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={filter.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={filter.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
              />
            </div>
            <div className="flex items-end gap-2">
              {(filter.from || filter.to) && (
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date();
                    lastMonth.setDate(today.getDate() - 30);
                    setFilter({
                      type: 'daily',
                      from: lastMonth.toISOString().split('T')[0],
                      to: today.toISOString().split('T')[0],
                    });
                  }}
                  className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Reset dates
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {report.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Purchases</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{totals.total_purchase}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                <FiTrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Amount</p>
                <p className="text-2xl font-semibold text-black mt-1">{formatCurrency(totals.total_amount)}</p>
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
                <p className="text-2xl font-semibold text-emerald-600 mt-1">{formatCurrency(totals.total_paid)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <FiCreditCard className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Remaining</p>
                <p className="text-2xl font-semibold text-red-600 mt-1">{formatCurrency(totals.total_remaining)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <FiAlertCircle className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {report.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiBarChart2 className="w-4 h-4 text-gray-400" />
                Amount Trend
              </h3>
              <span className="text-xs text-gray-400">By {filter.type === 'daily' ? 'Day' : 'Month'}</span>
            </div>
            <div className="h-72 sm:h-80">
              <Bar data={barChartData} options={barOptions} />
            </div>
          </div>

          {/* Doughnut Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiPieChart className="w-4 h-4 text-gray-400" />
                Payment Distribution
              </h3>
              <span className="text-xs text-gray-400">Paid vs Remaining</span>
            </div>
            <div className="h-72 sm:h-80">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiTrendingUp className="w-4 h-4 text-gray-400" />
                Purchase Count Trend
              </h3>
              <span className="text-xs text-gray-400">By {filter.type === 'daily' ? 'Day' : 'Month'}</span>
            </div>
            <div className="h-72 sm:h-80">
              <Line data={lineChartData} options={lineOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Report Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Report Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {report.length} records found
            </p>
          </div>
          {report.length > 0 && (
            <span className="text-xs text-gray-400">
              {filter.type === 'daily' ? 'Daily' : 'Monthly'} summary
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
            <p className="text-sm text-gray-500 mt-3">Loading report...</p>
          </div>
        ) : report.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrendingDown className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No report data found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your date range</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {filter.type === 'daily' ? 'Date' : 'Month'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchases
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.map((item, index) => {
                  const label = filter.type === 'daily' 
                    ? formatDate(item.date) 
                    : item.month;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-800">
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-600 font-medium">
                          {item.total_purchase || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-gray-800">
                          {formatCurrency(item.total_amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-emerald-600">
                          {formatCurrency(item.total_paid)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(item.total_remaining)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {report.length > 0 && (
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">Total</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">
                      {totals.total_purchase}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">
                      {formatCurrency(totals.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">
                      {formatCurrency(totals.total_paid)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-red-600">
                      {formatCurrency(totals.total_remaining)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseReportPage;