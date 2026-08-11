// pages/StockDashboardPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useStock } from '../../hooks/useStock';
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
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  FiPackage,
  FiBox,
  FiDollarSign,
  FiAlertCircle,
  FiRefreshCw,
  FiBell,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiCheckCircle,
  FiPieChart,
  FiList,
  FiCalendar,
  FiChevronRight,
} from 'react-icons/fi';

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

const StockDashboardPage = () => {
  const {
    lowStockProducts,
    stockMovement,
    inventoryValue,
    loading,
    loadLowStockProducts,
    loadStockMovement,
    loadInventoryValue,
    sendTestAlert,
  } = useStock();

  const [year, setYear] = useState(new Date().getFullYear());
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadLowStockProducts();
      loadStockMovement({ year });
      loadInventoryValue();
    }
  }, []);

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setYear(newYear);
    loadStockMovement({ year: newYear });
  };

  // Modern Stock Movement Chart
  const movementLabels = stockMovement.map(item => item.month);
  const movementData = {
    labels: movementLabels,
    datasets: [
      {
        label: 'Stock In',
        data: stockMovement.map(item => item.stock_in || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 4,
        barPercentage: 0.6,
      },
      {
        label: 'Stock Out',
        data: stockMovement.map(item => item.stock_out || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: '#ef4444',
        borderWidth: 2,
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };

  const movementOptions = {
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

  // Modern Low Stock Chart
  const lowStockChartData = {
    labels: lowStockProducts.slice(0, 10).map(p => p.name?.substring(0, 15) || ''),
    datasets: [
      {
        label: 'Current Stock',
        data: lowStockProducts.slice(0, 10).map(p => p.qty || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#ef4444',
        borderWidth: 2,
        borderRadius: 4,
        barPercentage: 0.5,
      },
      {
        label: 'Min Stock',
        data: lowStockProducts.slice(0, 10).map(p => p.min_stock || 0),
        backgroundColor: 'rgba(234, 179, 8, 0.7)',
        borderColor: '#eab308',
        borderWidth: 2,
        borderRadius: 4,
        barPercentage: 0.5,
      },
    ],
  };

  const lowStockOptions = {
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
            size: 10,
            family: "'Inter', system-ui, sans-serif",
          },
          color: '#9ca3af',
        },
      },
    },
  };

  // Doughnut chart for inventory distribution
  const getInventoryDistribution = () => {
    if (!inventoryValue?.products) return { labels: [], data: [] };
    const sorted = [...inventoryValue.products].sort((a, b) => b.total_value - a.total_value);
    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5);
    const othersValue = others.reduce((sum, p) => sum + p.total_value, 0);

    const labels = top5.map(p => p.name.substring(0, 20));
    const data = top5.map(p => p.total_value);

    if (othersValue > 0) {
      labels.push('Others');
      data.push(othersValue);
    }

    return { labels, data };
  };

  const distribution = getInventoryDistribution();
  const doughnutData = {
    labels: distribution.labels,
    datasets: [
      {
        data: distribution.data,
        backgroundColor: [
          'rgba(0, 0, 0, 0.9)',
          'rgba(75, 85, 99, 0.8)',
          'rgba(107, 114, 128, 0.7)',
          'rgba(156, 163, 175, 0.7)',
          'rgba(209, 213, 219, 0.7)',
          'rgba(229, 231, 235, 0.7)',
        ],
        borderColor: '#ffffff',
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
          padding: 15,
          font: {
            size: 11,
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
    cutout: '60%',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight flex items-center gap-2">
              <FiPackage className="w-6 h-6 text-gray-400" />
              Stock Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Real-time stock overview and analytics
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                loadLowStockProducts();
                loadInventoryValue();
                loadStockMovement({ year });
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
              disabled={loading}
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={async () => {
                const res = await sendTestAlert();
                if (res?.success) {
                  alert('Test alert sent successfully!');
                } else {
                  alert(res?.message || 'Failed to send test alert');
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
            >
              <FiBell className="w-4 h-4" />
              Alert
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {inventoryValue && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Products</p>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">
                    {inventoryValue.products?.length || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  <FiBox className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Quantity</p>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">
                    {inventoryValue.total_qty || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-black/5 flex items-center justify-center text-black">
                  <FiTrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Inventory Value</p>
                  <p className="text-2xl font-semibold text-emerald-600 mt-1">
                    {formatCurrency(inventoryValue.total_value)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FiDollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Low Stock Items</p>
                  <p className="text-2xl font-semibold text-red-600 mt-1">
                    {lowStockProducts.length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                  <FiAlertCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Stock Movement Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiBarChart2 className="w-4 h-4 text-gray-400" />
                Stock Movement
              </h3>
              <select
                value={year}
                onChange={handleYearChange}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none bg-white"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const y = new Date().getFullYear() - i;
                  return (
                    <option key={y} value={y}>{y}</option>
                  );
                })}
              </select>
            </div>
            <div className="h-72 sm:h-80">
              {stockMovement.length > 0 ? (
                <Bar data={movementData} options={movementOptions} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FiTrendingDown className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="text-sm font-medium">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Inventory Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
              <FiPieChart className="w-4 h-4 text-gray-400" />
              Inventory Distribution
            </h3>
            <div className="h-72 sm:h-80">
              {distribution.data.length > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FiPieChart className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="text-sm font-medium">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 text-gray-400" />
                Low Stock Products
              </h3>
              <span className="text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full font-medium">
                {lowStockProducts.length} items need attention
              </span>
            </div>
            <div className="h-72 sm:h-80">
              {lowStockProducts.length > 0 ? (
                <Bar data={lowStockChartData} options={lowStockOptions} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                    <FiCheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">All products are well stocked</p>
                  <p className="text-xs text-gray-400 mt-1">No low stock items found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Products Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/50">
            <div>
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiList className="w-4 h-4 text-gray-400" />
                Low Stock Products
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Products that need restocking
              </p>
            </div>
            <span className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full font-medium">
              {lowStockProducts.length} items need attention
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
              <p className="text-sm text-gray-500 mt-3">Loading...</p>
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-gray-500 font-medium">All products are well stocked</p>
              <p className="text-sm text-gray-400 mt-1">No low stock items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Barcode</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Min Stock</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lowStockProducts.map((item, index) => {
                    const stockStatus = item.qty === 0 ? 'Out of Stock' : 'Low Stock';
                    const statusColor = item.qty === 0 
                      ? 'bg-red-100 text-red-700 border-red-200' 
                      : 'bg-amber-100 text-amber-700 border-amber-200';

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium">
                              {item.name?.charAt(0).toUpperCase() || 'P'}
                            </div>
                            <span className="text-sm font-medium text-gray-800">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {item.barcode || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-red-600">
                          {item.qty}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500 hidden sm:table-cell">
                          {item.min_stock || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColor}`}>
                            {stockStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDashboardPage;