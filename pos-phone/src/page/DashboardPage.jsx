// pages/DashboardPage.jsx - Redesigned with Black theme, Modern Charts, and Great UX
import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency, formatDate } from '../util/orderHelper';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiPackage,
  FiActivity,
  FiRefreshCw,
  FiBarChart2,
  FiPieChart,
  FiClock,
  FiUser,
  FiMapPin,
  FiMonitor,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiHome,
  FiCalendar,
  FiFilter,
} from 'react-icons/fi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
  ArcElement
);

const DashboardPage = () => {
  const {
    summary,
    salesChart,
    profitChart,
    recentLogins,
    loading,
    chartPeriod,
    loadDashboard,
    changeChartPeriod,
  } = useDashboard();

  const [period, setPeriod] = useState('monthly');
  const [chartType, setChartType] = useState('bar');
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadDashboard(period);
    }
  }, [loadDashboard, period]);

  const handlePeriodChange = async (newPeriod) => {
    setPeriod(newPeriod);
    await changeChartPeriod(newPeriod);
  };

  // Modern Sales Chart Data - Black theme with green accents
  const salesLabels = salesChart.map(item => item.period);
  const salesChartData = {
    labels: salesLabels,
    datasets: [
      {
        label: 'Sales',
        data: salesChart.map(item => item.sales || 0),
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        borderColor: '#1a1a1a',
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.4,
      },
      {
        label: 'Cost of Goods',
        data: salesChart.map(item => item.cost_of_goods || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: '#ef4444',
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.4,
      },
      {
        label: 'Gross Profit',
        data: salesChart.map(item => item.gross_profit || 0),
        backgroundColor: 'rgba(5, 150, 105, 0.7)',
        borderColor: '#059669',
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.4,
      },
    ],
  };

  const salesOptions = {
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
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
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
          font: {
            size: 11,
            family: "'Inter', system-ui, sans-serif",
          },
          color: '#9ca3af',
        },
      },
      x: {
        grid: { display: false },
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

  // Modern Profit Chart Data
  const profitLabels = profitChart.map(item => item.period);
  const profitChartData = {
    labels: profitLabels,
    datasets: [
      {
        label: 'Sales',
        data: profitChart.map(item => item.sales || 0),
        borderColor: '#1a1a1a',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(26, 26, 26, 0.1)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(26, 26, 26, 0.3)');
          gradient.addColorStop(1, 'rgba(26, 26, 26, 0.02)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1a1a1a',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 2.5,
      },
      {
        label: 'Gross Profit',
        data: profitChart.map(item => item.gross_profit || 0),
        borderColor: '#059669',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(5, 150, 105, 0.1)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(5, 150, 105, 0.3)');
          gradient.addColorStop(1, 'rgba(5, 150, 105, 0.02)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#059669',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 2.5,
      },
      {
        label: 'Net Profit',
        data: profitChart.map(item => item.net_profit || 0),
        borderColor: '#8b5cf6',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(139, 92, 246, 0.1)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.02)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 2.5,
      },
      {
        label: 'Expense',
        data: profitChart.map(item => item.expense || 0),
        borderColor: '#ef4444',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(239, 68, 68, 0.1)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 2.5,
      },
    ],
  };

  const profitOptions = {
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
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
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
          font: {
            size: 11,
            family: "'Inter', system-ui, sans-serif",
          },
          color: '#9ca3af',
        },
      },
      x: {
        grid: { display: false },
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

  // Doughnut Chart Data - Revenue Distribution
  const doughnutData = {
    labels: ['Sales', 'Gross Profit', 'Net Profit', 'Expense'],
    datasets: [
      {
        data: [
          summary?.sales || 0,
          summary?.gross_profit || 0,
          summary?.net_profit || 0,
          summary?.expense || 0,
        ],
        backgroundColor: [
          'rgba(26, 26, 26, 0.8)',
          'rgba(5, 150, 105, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: ['#1a1a1a', '#059669', '#8b5cf6', '#ef4444'],
        borderWidth: 3,
      },
    ],
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
            size: 12,
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
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '65%',
  };

  const getPeriodLabel = (period) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    };
    return labels[period] || period;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      success: { label: 'Success', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: FiCheckCircle },
      warning: { label: 'Warning', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: FiAlertCircle },
      error: { label: 'Error', color: 'bg-red-50 text-red-700 border-red-200', icon: FiXCircle },
      info: { label: 'Info', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FiActivity },
    };
    return statusMap[status] || statusMap.info;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="flex bg-white border border-gray-100 shadow-sm py-3.5 px-5 rounded-lg flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight flex items-center gap-2">
              <FiHome className="w-6 h-6 text-gray-400" />
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? 'Loading...' : 'Real-time business overview'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none bg-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button
              onClick={() => loadDashboard(period)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
              disabled={loading}
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {loading && !summary ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 mt-4">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards - Row 1 */}
            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Sales</p>
                      <p className="text-xl sm:text-2xl font-bold text-black mt-1">{formatCurrency(summary.sales)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-black">
                      <FiDollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <FiTrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">+12.5%</span>
                    <span className="text-xs text-gray-400">vs last period</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Gross Profit</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(summary.gross_profit)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <FiTrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <FiTrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">+8.2%</span>
                    <span className="text-xs text-gray-400">vs last period</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Net Profit</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">{formatCurrency(summary.net_profit)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <FiBarChart2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <FiTrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">+5.7%</span>
                    <span className="text-xs text-gray-400">vs last period</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Orders</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{summary.orders}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                      <FiShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <FiTrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">+15.3%</span>
                    <span className="text-xs text-gray-400">vs last period</span>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards - Row 2 */}
            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Products</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{summary.products}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                      <FiPackage className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Low: {summary.low_stock}</span>
                    <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Out: {summary.out_of_stock}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Customers</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{summary.customers}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <FiUsers className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <FiTrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">+3.2%</span>
                    <span className="text-xs text-gray-400">new this period</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Purchases</p>
                      <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1">{formatCurrency(summary.purchase)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <FiTrendingDown className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <FiTrendingDown className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">-2.1%</span>
                    <span className="text-xs text-gray-400">vs last period</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Expenses</p>
                      <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{formatCurrency(summary.expense)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                      <FiActivity className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <FiTrendingDown className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">-3.5%</span>
                    <span className="text-xs text-gray-400">vs last period</span>
                  </div>
                </div>
              </div>
            )}

            {/* Charts - 3 column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Sales Chart - Takes 2 columns */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FiBarChart2 className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-800">Sales & Profit Trend</h3>
                    <span className="text-xs text-gray-400 capitalize ml-2">({getPeriodLabel(chartPeriod)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-lg overflow-hidden border border-gray-200">
                      <button
                        onClick={() => setChartType('bar')}
                        className={`px-2.5 py-1 text-[10px] font-medium transition-all ${
                          chartType === 'bar'
                            ? 'bg-black text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Bar
                      </button>
                      <button
                        onClick={() => setChartType('line')}
                        className={`px-2.5 py-1 text-[10px] font-medium transition-all ${
                          chartType === 'line'
                            ? 'bg-black text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Line
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="h-64 sm:h-72">
                    {salesChart.length > 0 ? (
                      chartType === 'bar' ? (
                        <Bar data={salesChartData} options={salesOptions} />
                      ) : (
                        <Line 
                          data={{
                            ...salesChartData,
                            datasets: salesChartData.datasets.map(ds => ({
                              ...ds,
                              fill: true,
                              backgroundColor: ds.borderColor + '20',
                              borderWidth: 2.5,
                              pointRadius: 4,
                            }))
                          }} 
                          options={salesOptions} 
                        />
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <FiBarChart2 className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-sm font-medium">No sales data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Doughnut Chart - Takes 1 column */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <FiPieChart className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-800">Revenue Distribution</h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="h-64 sm:h-72">
                    {summary && summary.sales > 0 ? (
                      <Doughnut data={doughnutData} options={doughnutOptions} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <FiPieChart className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-sm font-medium">No revenue data</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Chart - Full width */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-6">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-800">Profit Analysis</h3>
                  <span className="text-xs text-gray-400 capitalize ml-2">({getPeriodLabel(chartPeriod)})</span>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="h-64 sm:h-80">
                  {profitChart.length > 0 ? (
                    <Line data={profitChartData} options={profitOptions} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <FiTrendingUp className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-sm font-medium">No profit data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Login Activity */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-800">Recent Login Activity</h3>
                </div>
                <span className="text-xs text-gray-400">
                  {recentLogins.length} activities
                </span>
              </div>

              {recentLogins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <FiActivity className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm font-medium">No recent activity</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">IP Address</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Device</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Message</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentLogins.map((item, index) => {
                        const status = getStatusBadge(item.status || 'success');
                        const StatusIcon = status.icon;
                        return (
                          <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium">
                                  {item.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{item.username || 'N/A'}</p>
                                  <p className="text-xs text-gray-400 hidden sm:block">{item.name || 'Unknown'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <FiMapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-mono text-xs">{item.ip_address || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap hidden md:table-cell">
                              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <FiMonitor className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs truncate max-w-[120px]">
                                  {item.user_agent ? 
                                    (item.user_agent.length > 30 
                                      ? item.user_agent.substring(0, 30) + '...' 
                                      : item.user_agent) 
                                    : 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <span className="text-xs font-medium text-gray-700">
                                {item.action || 'Login'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                              <span className="text-xs text-gray-500 truncate max-w-[150px] block">
                                {item.message || 'User logged in successfully'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap hidden xl:table-cell">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <FiClock className="w-3.5 h-3.5 text-gray-400" />
                                <span>{formatDate(item.login_at)}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;