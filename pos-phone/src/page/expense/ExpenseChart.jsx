// components/ExpenseChart.jsx
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
import useExpense from '../../hooks/useExpense';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiCalendar, FiRefreshCw } from 'react-icons/fi';

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

const ExpenseChart = () => {
  const { chartData, loadChart, loading } = useExpense();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    loadChart({ year: selectedYear });
  }, [selectedYear]);

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 5; i >= 0; i--) {
      years.push(currentYear - i);
    }
    return years;
  };

  const createGradient = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.12)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.04)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.01)');
    return gradient;
  };

  const getBaseChartData = () => ({
    labels: chartData.map(item => item.month_name),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: chartData.map(item => item.total),
        borderColor: '#1a1a1a',
        backgroundColor: chartType === 'line' 
          ? (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) {
                return 'rgba(0, 0, 0, 0.05)';
              }
              return createGradient(ctx);
            }
          : chartData.map(item => 
              item.total > 0 ? 'rgba(0, 0, 0, 0.7)' : '#E5E7EB'
            ),
        fill: chartType === 'line',
        tension: 0.4,
        pointBackgroundColor: chartData.map(item => 
          item.total > 0 ? '#1a1a1a' : '#E5E7EB'
        ),
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: chartType === 'line' ? 4 : 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#333333',
        borderWidth: chartType === 'line' ? 2.5 : 2,
        borderRadius: chartType === 'bar' ? 4 : 0,
        barPercentage: chartType === 'bar' ? 0.6 : undefined,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        callbacks: {
          label: function(context) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(context.parsed.y);
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
            family: "'Inter', system-ui, sans-serif",
          },
          color: '#9CA3AF',
          padding: 4,
        },
      },
    },
    elements: {
      line: {
        borderJoinStyle: 'round',
      },
    },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalYearExpense = chartData.reduce((sum, item) => sum + item.total, 0);
  const averageMonthly = chartData.length > 0 ? totalYearExpense / 12 : 0;
  const maxMonth = chartData.reduce((max, item) => 
    item.total > max.total ? item : max, 
    { total: 0, month_name: 'N/A' }
  );
  const monthsWithExpenses = chartData.filter(item => item.total > 0).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-800">Monthly Overview</h3>
          <p className="text-xs text-gray-400 mt-0.5">Expense trends throughout the year</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
            <button
              onClick={() => setChartType('line')}
              className={`px-3.5 py-2 text-xs font-medium transition-all ${
                chartType === 'line'
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3.5 py-2 text-xs font-medium transition-all ${
                chartType === 'bar'
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Bar
            </button>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none text-xs bg-white text-gray-700"
          >
            {getYearOptions().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">
            <FiDollarSign className="w-3 h-3" /> Total
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{formatCurrency(totalYearExpense)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">
            <FiTrendingUp className="w-3 h-3" /> Monthly Average
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{formatCurrency(averageMonthly)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">
            <FiCalendar className="w-3 h-3" /> Peak Month
          </p>
          <p className="text-lg font-semibold text-black mt-1">
            {maxMonth.total > 0 ? `${maxMonth.month_name} · ${formatCurrency(maxMonth.total)}` : '—'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
          <p className="text-xs text-gray-400 mt-3">Loading chart data...</p>
        </div>
      ) : chartData.some(item => item.total > 0) ? (
        <div className="relative" style={{ height: '280px' }}>
          {chartType === 'line' ? (
            <Line data={getBaseChartData()} options={chartOptions} />
          ) : (
            <Bar data={getBaseChartData()} options={chartOptions} />
          )}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <FiTrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">No data available</p>
          <p className="text-xs text-gray-400 mt-1">Add expenses for {selectedYear} to see your trends</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;