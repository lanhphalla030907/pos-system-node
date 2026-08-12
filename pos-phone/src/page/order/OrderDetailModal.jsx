// components/OrderDetailModal.jsx
import React from 'react';
import ProductImage from '../../components/product/ProductImage';
import { formatCurrency, formatDate } from '../../util/orderHelper';
import ReprintButton from '../../components/pos/ReprintButton';
import {
  FiX,
  FiUser,
  FiCreditCard,
  FiClock,
  FiPackage,
  FiShoppingBag,
  FiTrendingUp,
} from 'react-icons/fi';

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const subtotal = order.subtotal || 0;
  const totalProductDiscount = order.total_product_discount || 0;
  const totalMemberDiscount = order.total_member_discount || 0;
  const totalDiscount = order.total_discount || 0;
  const finalTotal = order.total_amount || 0;
  const paid = order.paid || 0;
  const change = paid - finalTotal;

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
    };
    return statusMap[status] || statusMap.completed;
  };

  const status = getStatusBadge(order.status);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-modalIn">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
              <FiShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Order Details</h2>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span className="font-mono">{order.order_no}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                  {status.label}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Order Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiClock className="w-3.5 h-3.5" />
                <p className="text-xs font-medium uppercase tracking-wider">Date</p>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{formatDate(order.create_at)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiUser className="w-3.5 h-3.5" />
                <p className="text-xs font-medium uppercase tracking-wider">Cashier</p>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{order.cashier_name || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiCreditCard className="w-3.5 h-3.5" />
                <p className="text-xs font-medium uppercase tracking-wider">Payment</p>
              </div>
              <p className="font-semibold text-gray-800 text-sm uppercase">{order.payment_method || 'Cash'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <FiPackage className="w-3.5 h-3.5" />
                <p className="text-xs font-medium uppercase tracking-wider">Items</p>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{order.items?.length || 0} products</p>
            </div>
          </div>

          {/* Customer Info */}
          {order.customer_name && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <FiUser className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-gray-700">Customer Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="font-medium text-gray-800">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="font-medium text-gray-800">{order.customer_tel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="font-medium text-gray-800 capitalize">{order.customer_type || 'Regular'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Spent</p>
                  <p className="font-medium text-gray-800">{formatCurrency(order.customer_total_spent)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FiShoppingBag className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-700">Order Items</h3>
              <span className="text-xs text-gray-400">({order.items?.length || 0} items)</span>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Discount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items?.map((item, index) => {
                      const price = parseFloat(item.price) || 0;
                      const productDiscount = parseFloat(item.discount) || 0;
                      const memberDiscount = parseFloat(item.member_discount) || 0;
                      const qty = parseFloat(item.qty) || 0;
                      const finalTotal = parseFloat(item.total) || 0;

                      return (
                        <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-3">
                              {item.product_image ? (
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                  <ProductImage image={item.product_image} alt={item.product_name} size="md" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <FiPackage className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                              <span className="font-medium text-gray-800">{item.product_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-medium">{qty}</td>
                          <td className="px-4 py-3 text-sm text-right">{formatCurrency(price)}</td>
                          <td className="px-4 py-3 text-sm text-right hidden sm:table-cell">
                            {(productDiscount > 0 || memberDiscount > 0) ? (
                              <div className="space-y-0.5">
                                {productDiscount > 0 && (
                                  <div className="text-red-500 text-xs">Product -{productDiscount}%</div>
                                )}
                                {memberDiscount > 0 && (
                                  <div className="text-emerald-500 text-xs">Member -{memberDiscount}%</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-gray-800">
                            {formatCurrency(finalTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan="3" className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-gray-600 hidden sm:table-cell">Subtotal:</td>
                      <td className="px-4 py-2 text-right font-semibold text-gray-800">
                        {formatCurrency(subtotal)}
                      </td>
                    </tr>
                    {totalProductDiscount > 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-right text-sm text-red-500 font-medium hidden sm:table-cell">Product Discount:</td>
                        <td className="px-4 py-2 text-right text-sm text-red-500 font-semibold">
                          -{formatCurrency(totalProductDiscount)}
                        </td>
                      </tr>
                    )}
                    {totalMemberDiscount > 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-right text-sm text-emerald-500 font-medium hidden sm:table-cell">Member Discount:</td>
                        <td className="px-4 py-2 text-right text-sm text-emerald-500 font-semibold">
                          -{formatCurrency(totalMemberDiscount)}
                        </td>
                      </tr>
                    )}
                    {totalDiscount > 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-right text-sm text-purple-500 font-medium hidden sm:table-cell">Total Discount:</td>
                        <td className="px-4 py-2 text-right text-sm text-purple-500 font-semibold">
                          -{formatCurrency(totalDiscount)}
                        </td>
                      </tr>
                    )}
                    <tr className="border-t border-gray-300">
                      <td colSpan="3" className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-right text-sm font-bold text-gray-800 hidden sm:table-cell">Total:</td>
                      <td className="px-4 py-2 text-right text-base font-bold text-black">
                        {formatCurrency(finalTotal)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-emerald-600 hidden sm:table-cell">Paid:</td>
                      <td className="px-4 py-2 text-right text-sm font-semibold text-emerald-600">
                        {formatCurrency(paid)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-gray-600 hidden sm:table-cell">Change:</td>
                      <td className="px-4 py-2 text-right text-sm font-bold text-emerald-600">
                        {formatCurrency(change)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Remark */}
          {order.remark && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Remark</p>
              <p className="text-sm text-gray-700">{order.remark}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiTrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Order completed successfully</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl border border-gray-200 transition-colors"
            >
              Close
            </button>
            {/* ✅ Using ReprintButton component here */}
            <ReprintButton 
              order={order} 
              size="md"
              buttonText="Print Receipt"
              variant="primary"
            />
          </div>
        </div>

        <style>{`
          @keyframes modalIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          .animate-modalIn {
            animation: modalIn 0.2s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default OrderDetailModal;