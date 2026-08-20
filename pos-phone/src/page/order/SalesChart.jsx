// components/SalesChart.jsx - With Green as Secondary Color & Great UX
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
import {
  FiTrendingUp,
  FiDollarSign,
  FiPackage,
  FiBarChart2,
  FiRefreshCw,
  FiStar,
  FiAward,
  FiGrid,
  FiShoppingBag,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

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

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTopProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [productLimit, dateFrom, dateTo]);

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 5; i >= 0; i--) {
      years.push(currentYear - i);
    }
    return years;
  };

  const monthOptions = [
    { value: '1', label: 'Jan' },
    { value: '2', label: 'Feb' },
    { value: '3', label: 'Mar' },
    { value: '4', label: 'Apr' },
    { value: '5', label: 'May' },
    { value: '6', label: 'Jun' },
    { value: '7', label: 'Jul' },
    { value: '8', label: 'Aug' },
    { value: '9', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dec' },
  ];

  const getLabels = () => {
    if (groupBy === 'month') {
      return salesData.map(item => item.label || `Month ${item.month}`);
    } else if (groupBy === 'day') {
      return salesData.map(item => item.full_date ? new Date(item.full_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : item.label);
    } else {
      return salesData.map(item => item.label?.toString() || '');
    }
  };

  // Chart Data - Black primary, Green secondary
  const chartDataConfig = {
    labels: getLabels(),
    datasets: [
      {
        label: 'Orders',
        data: salesData.map(item => item.total_orders || 0),
        borderColor: '#1a1a1a',
        backgroundColor: chartType === 'line' 
          ? (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) return 'rgba(26,26,26,0.1)';
              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, 'rgba(26,26,26,0.2)');
              gradient.addColorStop(0.6, 'rgba(26,26,26,0.05)');
              gradient.addColorStop(1, 'rgba(26,26,26,0.01)');
              return gradient;
            }
          : 'rgba(26,26,26,0.7)',
        fill: chartType === 'line',
        tension: 0.4,
        pointBackgroundColor: '#1a1a1a',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: chartType === 'line' ? 4 : 0,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#000000',
        borderWidth: chartType === 'line' ? 2.5 : 2,
        borderRadius: chartType === 'bar' ? 6 : 0,
        barPercentage: chartType === 'bar' ? 0.4 : undefined,
        yAxisID: 'y',
      },
      {
        label: 'Revenue',
        data: salesData.map(item => item.total_sales || 0),
        borderColor: '#059669',
        backgroundColor: chartType === 'line' 
          ? (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) return 'rgba(5,150,105,0.1)';
              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, 'rgba(5,150,105,0.2)');
              gradient.addColorStop(0.6, 'rgba(5,150,105,0.05)');
              gradient.addColorStop(1, 'rgba(5,150,105,0.01)');
              return gradient;
            }
          : 'rgba(5,150,105,0.6)',
        fill: chartType === 'line',
        tension: 0.4,
        pointBackgroundColor: '#059669',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: chartType === 'line' ? 4 : 0,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#047857',
        borderWidth: chartType === 'line' ? 2.5 : 2,
        borderRadius: chartType === 'bar' ? 6 : 0,
        barPercentage: chartType === 'bar' ? 0.4 : undefined,
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
        backgroundColor: '#ffffff',
        titleColor: '#1a1a1a',
        bodyColor: '#1a1a1a',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 14,
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            let value = context.parsed.y;
            if (context.dataset.label === 'Revenue') {
              value = '$' + value.toLocaleString();
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
          color: 'rgba(0,0,0,0.04)',
          drawBorder: false,
        },
        ticks: {
          font: { size: 11, weight: '500', family: "'Inter', system-ui, sans-serif" },
          color: '#9ca3af',
          padding: 8,
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        ticks: {
          callback: function(value) {
            if (value === 0) return '$0';
            if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'k';
            return '$' + value.toLocaleString();
          },
          font: { size: 11, weight: '500', family: "'Inter', system-ui, sans-serif" },
          color: '#9ca3af',
          padding: 8,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11, weight: '500', family: "'Inter', system-ui, sans-serif" },
          color: '#9ca3af',
          padding: 4,
          maxRotation: 45,
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

  const totalOrders = salesData.reduce((sum, item) => sum + (item.total_orders || 0), 0);
  const totalSales = salesData.reduce((sum, item) => sum + (item.total_sales || 0), 0);
  const averageSales = salesData.length > 0 ? totalSales / salesData.length : 0;

  const topPerformer = salesData.reduce((max, item) => 
    (item.total_sales || 0) > (max.total_sales || 0) ? item : max, 
    { total_sales: 0, label: '' }
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards - Black + Green accents */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-black/5 flex items-center justify-center text-black">
              <FiShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <FiTrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">+12.5%</span>
            <span className="text-xs text-gray-400">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalSales)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <FiTrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">+8.2%</span>
            <span className="text-xs text-gray-400">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(averageSales)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
              <FiBarChart2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Average per transaction</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Best Period</p>
              <p className="text-base font-bold text-gray-900 mt-1 truncate">{topPerformer.label || 'N/A'}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <FiStar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{formatCurrency(topPerformer.total_sales)} revenue</p>
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <FiGrid className="w-4 h-4 text-gray-400" />
              Sales Performance
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Track your sales trends over time</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-gray-700 hover:border-gray-300 transition-colors"
            >
              <option value="month">Monthly</option>
              <option value="day">Daily</option>
              <option value="year">Yearly</option>
            </select>

            {groupBy === 'day' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-gray-700 hover:border-gray-300 transition-colors"
              >
                <option value="">All Months</option>
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            )}

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-gray-700 hover:border-gray-300 transition-colors"
            >
              {getYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${
                  chartType === 'line'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${
                  chartType === 'bar'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Bar
              </button>
            </div>

            <button
              onClick={() => {
                loadData();
                loadTopProducts();
              }}
              className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80">
              <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400 mt-4">Loading chart data...</p>
            </div>
          ) : salesData.length > 0 ? (
            <div className="h-80">
              {chartType === 'line' ? (
                <Line data={chartDataConfig} options={chartOptions} />
              ) : (
                <Bar data={chartDataConfig} options={chartOptions} />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FiBarChart2 className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No data available</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Products Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <FiAward className="w-4 h-4 text-gray-400" />
              Top Selling Products
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Best performing products in your store</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-gray-700 hover:border-gray-300 transition-colors"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-gray-700 hover:border-gray-300 transition-colors"
            />
            <select
              value={productLimit}
              onChange={(e) => setProductLimit(parseInt(e.target.value))}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-gray-700 hover:border-gray-300 transition-colors"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {productsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400 mt-4">Loading products...</p>
            </div>
          ) : topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-50">
                {topProducts.map((product, index) => {
                  const totalRevenue = topProducts.reduce((sum, p) => sum + (p.total_sales || 0), 0);
                  const percentage = totalRevenue > 0 ? ((product.total_sales || 0) / totalRevenue * 100).toFixed(1) : 0;
                  const rankColors = [
                    'bg-black text-white',
                    'bg-gray-700 text-white',
                    'bg-gray-600 text-white',
                    'bg-gray-500 text-white',
                    'bg-gray-400 text-white',
                  ];

                  return (
                    <div key={product.product_id || index} className="p-3 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center justify-center w-6 h-6 text-[10px] font-bold rounded-full ${rankColors[index] || 'bg-gray-200 text-gray-600'}`}>
                            {index + 1}
                          </span>
                          <p className="text-sm font-medium text-gray-800">{product.product_name || 'Unknown Product'}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(product.total_sales || 0)}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400 ml-8">
                        <span>Sold: {product.total_qty || 0}</span>
                        <span>{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="text-right py-3 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Sold</th>
                      <th className="text-right py-3 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue</th>
                      <th className="text-right py-3 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topProducts.map((product, index) => {
                      const totalRevenue = topProducts.reduce((sum, p) => sum + (p.total_sales || 0), 0);
                      const percentage = totalRevenue > 0 ? ((product.total_sales || 0) / totalRevenue * 100).toFixed(1) : 0;

                      const rankColors = [
                        'bg-black text-white',
                        'bg-gray-700 text-white',
                        'bg-gray-600 text-white',
                        'bg-gray-500 text-white',
                        'bg-gray-400 text-white',
                      ];

                      return (
                        <tr key={product.product_id || index} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full ${rankColors[index] || 'bg-gray-200 text-gray-600'}`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs">
                                {product.product_name?.charAt(0).toUpperCase() || 'P'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {product.product_name || 'Unknown Product'}
                                </p>
                                <p className="text-xs text-gray-400 font-mono">
                                  {product.product_code || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-sm font-semibold text-gray-700">
                              {product.total_qty || 0}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(product.total_sales || 0)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-gray-500">{percentage}%</span>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-1.5 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FiPackage className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No products data</p>
              <p className="text-sm text-gray-400 mt-1">Sales data will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesChart;