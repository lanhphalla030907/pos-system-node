// components/SalesChart.jsx
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import useSales from '../../hooks/useSales';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SalesChart = () => {
  const { 
    salesData, 
    loading,
    topProducts,
    productsLoading,
    loadSalesChart,
    loadTopSaleProducts,
  } = useSales();
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [groupBy, setGroupBy] = useState('month');
  const [chartType, setChartType] = useState('line');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [productLimit, setProductLimit] = useState(10);

  useEffect(() => {
    loadData();
    loadTopProducts();
  }, []);

  useEffect(() => {
    if (selectedYear || groupBy || selectedMonth) {
      loadData();
    }
  }, [selectedYear, groupBy, selectedMonth]);

  const loadData = () => {
    const filter = {
      year: selectedYear,
      group_by: groupBy,
    };
    
    if (groupBy === 'day' && selectedMonth) {
      filter.month = selectedMonth;
    }
    
    loadSalesChart(filter);
  };

  const loadTopProducts = () => {
    const filter = {
      limit: productLimit,
    };
    
    if (dateFrom) filter.date_from = dateFrom;
    if (dateTo) filter.date_to = dateTo;
    
    loadTopSaleProducts(filter);
  };

  // Handle product filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTopProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [productLimit, dateFrom, dateTo]);

  // Generate year options (last 5 years)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 5; i >= 0; i--) {
      years.push(currentYear - i);
    }
    return years;
  };

  // Month options for day view
  const monthOptions = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Prepare labels
  const getLabels = () => {
    if (groupBy === 'month') {
      return salesData.map(item => item.label || `Month ${item.month}`);
    } else if (groupBy === 'day') {
      return salesData.map(item => item.full_date ? new Date(item.full_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : item.label);
    } else {
      return salesData.map(item => item.label?.toString() || '');
    }
  };

  // Gradient fill for line chart
  const createGradient = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)');
    return gradient;
  };

  // Prepare chart data
  const chartDataConfig = {
    labels: getLabels(),
    datasets: [
      {
        label: 'Total Orders',
        data: salesData.map(item => item.total_orders || 0),
        borderColor: '#3B82F6',
        backgroundColor: chartType === 'line' 
          ? (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) {
                return 'rgba(59, 130, 246, 0.1)';
              }
              return createGradient(ctx);
            }
          : 'rgba(59, 130, 246, 0.7)',
        fill: chartType === 'line',
        tension: 0.4,
        pointBackgroundColor: salesData.map(item => 
          item.total_orders > 0 ? '#3B82F6' : '#E5E7EB'
        ),
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: chartType === 'line' ? 4 : 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#2563EB',
        borderWidth: chartType === 'line' ? 2.5 : 2,
        borderRadius: chartType === 'bar' ? 6 : 0,
        barPercentage: chartType === 'bar' ? 0.6 : undefined,
        yAxisID: 'y',
      },
      {
        label: 'Total Sales',
        data: salesData.map(item => item.total_sales || 0),
        borderColor: '#10B981',
        backgroundColor: chartType === 'line' 
          ? (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) {
                return 'rgba(16, 185, 129, 0.1)';
              }
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
              gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.05)');
              gradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
              return gradient;
            }
          : 'rgba(16, 185, 129, 0.7)',
        fill: chartType === 'line',
        tension: 0.4,
        pointBackgroundColor: salesData.map(item => 
          item.total_sales > 0 ? '#10B981' : '#E5E7EB'
        ),
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: chartType === 'line' ? 4 : 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#059669',
        borderWidth: chartType === 'line' ? 2.5 : 2,
        borderRadius: chartType === 'bar' ? 6 : 0,
        barPercentage: chartType === 'bar' ? 0.6 : undefined,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            let value = context.parsed.y;
            if (context.dataset.label === 'Total Sales') {
              value = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(value);
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.04)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#9CA3AF',
          padding: 8,
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value) {
            if (value === 0) return '$0';
            if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'k';
            return '$' + value.toLocaleString();
          },
          font: {
            size: 11,
          },
          color: '#9CA3AF',
          padding: 8,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: '500',
          },
          color: '#9CA3AF',
          padding: 4,
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Calculate totals
  const totalOrders = salesData.reduce((sum, item) => sum + (item.total_orders || 0), 0);
  const totalSales = salesData.reduce((sum, item) => sum + (item.total_sales || 0), 0);
  const averageOrders = salesData.length > 0 ? Math.round(totalOrders / salesData.length) : 0;
  const averageSales = salesData.length > 0 ? totalSales / salesData.length : 0;

  // Get group label
  const getGroupLabel = () => {
    switch (groupBy) {
      case 'day': return 'Daily';
      case 'year': return 'Yearly';
      default: return 'Monthly';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Chart Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Sales Overview</h3>
            <p className="text-sm text-gray-400">Monitor your sales performance</p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-400">{getGroupLabel()} sales trends</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Group By Selector */}
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-700 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <option value="month">Monthly</option>
              <option value="day">Daily</option>
              <option value="year">Yearly</option>
            </select>

            {/* Month Selector (only for day view) */}
            {groupBy === 'day' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-700 cursor-pointer hover:border-gray-300 transition-colors"
              >
                <option value="">All Months</option>
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            )}

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-700 cursor-pointer hover:border-gray-300 transition-colors"
            >
              {getYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Chart Type Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
              <button
                onClick={() => setChartType('line')}
                className={`px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  chartType === 'line'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  chartType === 'bar'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Bar
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-100/80">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Orders</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{totalOrders}</p>
          </div>
          <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-100/80">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Sales</p>
            <p className="text-xl font-semibold text-green-600 mt-1">{formatCurrency(totalSales)}</p>
          </div>
          <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-100/80">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avg Orders</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{averageOrders}</p>
          </div>
          <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-100/80">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avg Sales</p>
            <p className="text-xl font-semibold text-blue-600 mt-1">{formatCurrency(averageSales)}</p>
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-400 mt-3">Loading chart data...</p>
          </div>
        ) : salesData.length > 0 ? (
          <div className="relative" style={{ height: '350px' }}>
            {chartType === 'line' ? (
              <Line data={chartDataConfig} options={chartOptions} />
            ) : (
              <Bar data={chartDataConfig} options={chartOptions} />
            )}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 font-medium">No data available</p>
            <p className="text-sm text-gray-400 mt-1">No sales data found for the selected filters</p>
          </div>
        )}
      </div>

      {/* Top Sale Products Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Top Sale Products</h3>
            <p className="text-sm text-gray-400">Best performing products</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Filters */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-700"
              placeholder="Date From"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-700"
              placeholder="Date To"
            />
            <select
              value={productLimit}
              onChange={(e) => setProductLimit(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-700 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
          </div>
        </div>

        {productsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-400 mt-3">Loading products...</p>
          </div>
        ) : topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sold</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.map((product, index) => (
                  <tr key={product.product_id || index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-semibold rounded-full ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' :
                        index === 1 ? 'bg-gray-200 text-gray-600 border-2 border-gray-300' :
                        index === 2 ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900">
                        {product.product_name || 'Unknown Product'}
                      </span>
                    </td>
                     <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900">
                        {product.product_code || 'Unknown barcode'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-gray-700">
                        {product.total_qty || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(product.total_sales || 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-500 font-medium">No products data</p>
            <p className="text-sm text-gray-400 mt-1">Products will appear here when sales are recorded</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesChart;