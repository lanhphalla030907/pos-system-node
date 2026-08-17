// components/TodaySales.jsx - Fixed
import React, { useEffect } from "react";
import useSales from "../../hooks/useSales";

const TodaySales = () => {
  const {
    todaySummary,
    todayOrders,
    todayLoading,
    loadTodaySummary,
    loadTodayOrders,
  } = useSales();

  useEffect(() => {
    loadTodaySummary();
    loadTodayOrders();
  }, []);

  // ✅ FIXED: Show 2 decimal places
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,  // ✅ Changed from 0 to 2
      maximumFractionDigits: 2,  // ✅ Added this for consistency
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get icon for each stat
  const getStatIcon = (type) => {
    switch (type) {
      case "orders":
        return (
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        );
      case "sales":
        return (
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "paid":
        return (
          <svg
            className="w-5 h-5 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        );
      case "due":
        return (
          <svg
            className="w-5 h-5 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient accent */}
      <div className="relative overflow-hidden bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Today's Sales
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {formatDate(new Date())}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                Live
              </span>
              <span className="text-xs text-gray-400">
                Updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards - Modern grid with icons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 pb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200/50 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1.5">
                  {todayLoading ? "..." : todaySummary?.total_orders || 0}
                </p>
              </div>
              <div className="bg-blue-200/50 p-2 rounded-lg">
                {getStatIcon("orders")}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-200/50 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium uppercase tracking-wider">
                  Total Sales
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1.5">
                  {todayLoading
                    ? "..."
                    : formatCurrency(todaySummary?.total_sales || 0)}
                </p>
              </div>
              <div className="bg-green-200/50 p-2 rounded-lg">
                {getStatIcon("sales")}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200/50 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">
                  Total Paid
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1.5">
                  {todayLoading
                    ? "..."
                    : formatCurrency(todaySummary?.total_paid || 0)}
                </p>
              </div>
              <div className="bg-purple-200/50 p-2 rounded-lg">
                {getStatIcon("paid")}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-5 border border-orange-200/50 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium uppercase tracking-wider">
                  Total Due
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1.5">
                  {todayLoading
                    ? "..."
                    : formatCurrency(todaySummary?.total_due || 0)}
                </p>
              </div>
              <div className="bg-orange-200/50 p-2 rounded-lg">
                {getStatIcon("due")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table - Modern design */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">
              Order Details
            </h4>
            <span className="text-xs text-gray-400">
              {todayOrders?.length || 0} orders
            </span>
          </div>
        </div>

        {todayLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-blue-600"></div>
            <p className="text-sm text-gray-500 mt-4">Loading orders...</p>
          </div>
        ) : todayOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/30 border-b border-gray-200">
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Cashier
                  </th>
                  <th className="text-right py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-right py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {todayOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/70 transition-colors group"
                  >
                    <td className="py-3.5 px-6">
                      <span className="text-sm font-mono font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md group-hover:bg-gray-200 transition-colors">
                        {order.order_no}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-sm text-gray-900">
                        {order.customer_name || "Walk-in"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-sm text-gray-600">
                        {order.cashier_name || "-"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(order.paid)}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {order.payment_method || "N/A"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-sm text-gray-500">
                        {order.create_at ? formatTime(order.create_at) : "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No orders today</p>
            <p className="text-sm text-gray-400 mt-1">
              Sales will appear here as they come in
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaySales;