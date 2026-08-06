// components/OrderDetailModal.jsx
import React from 'react';
import ProductImage from '../../components/product/ProductImage';
import { formatCurrency, formatDate } from '../../util/orderHelper';

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;


  const subtotal = order.subtotal || 0;
  const totalProductDiscount = order.total_product_discount || 0;
  const totalMemberDiscount = order.total_member_discount || 0;
  const totalDiscount = order.total_discount || 0;
  const finalTotal = order.total_amount || 0;
  const paid = order.paid || 0;
  const change = paid - finalTotal;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
            <p className="text-sm text-gray-500">{order.order_no}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-xs text-gray-500">Order No</p>
              <p className="font-semibold">{order.order_no}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-semibold">{formatDate(order.create_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Cashier</p>
              <p className="font-semibold">{order.cashier_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Payment</p>
              <p className="font-semibold uppercase">{order.payment_method || 'Cash'}</p>
            </div>
          </div>

          {/* Customer Info */}
          {order.customer_name && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Customer Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">{order.customer_tel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-medium capitalize">{order.customer_type || 'Regular'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="font-medium">{formatCurrency(order.customer_total_spent)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Order Items</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items?.map((item, index) => {
                    const price = parseFloat(item.price) || 0;
                    const productDiscount = parseFloat(item.discount) || 0;
                    const memberDiscount = parseFloat(item.member_discount) || 0;
                    const qty = parseFloat(item.qty) || 0;
                    // ✅ ប្រើ total ពី Backend
                    const finalTotal = parseFloat(item.total) || 0;

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            {item.product_image && (
                              <ProductImage image={item.product_image} alt={item.product_name} size="md" />
                            )}
                            <span>{item.product_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-center">{qty}</td>
                        <td className="px-4 py-2 text-sm text-right">{formatCurrency(price)}</td>
                        <td className="px-4 py-2 text-sm text-right">
                          {(productDiscount > 0 || memberDiscount > 0) ? (
                            <div className="text-right">
                              {productDiscount > 0 && (
                                <div className="text-red-600 text-xs">Product: -{productDiscount}%</div>
                              )}
                              {memberDiscount > 0 && (
                                <div className="text-green-600 text-xs">Member: -{memberDiscount}%</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-semibold">
                          {formatCurrency(finalTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td colSpan="3" className="px-4 py-2"></td>
                    <td className="px-4 py-2 text-right text-sm font-medium">Subtotal:</td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {formatCurrency(subtotal)}
                    </td>
                  </tr>
                  {totalProductDiscount > 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-right text-sm text-red-600 font-medium">Product Discount:</td>
                      <td className="px-4 py-2 text-right text-sm text-red-600 font-semibold">
                        -{formatCurrency(totalProductDiscount)}
                      </td>
                    </tr>
                  )}
                  {totalMemberDiscount > 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-right text-sm text-green-600 font-medium">Member Discount:</td>
                      <td className="px-4 py-2 text-right text-sm text-green-600 font-semibold">
                        -{formatCurrency(totalMemberDiscount)}
                      </td>
                    </tr>
                  )}
                  {totalDiscount > 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-right text-sm text-purple-600 font-medium">Total Discount:</td>
                      <td className="px-4 py-2 text-right text-sm text-purple-600 font-semibold">
                        -{formatCurrency(totalDiscount)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-gray-300">
                    <td colSpan="3" className="px-4 py-2"></td>
                    <td className="px-4 py-2 text-right text-sm font-bold">Total:</td>
                    <td className="px-4 py-2 text-right text-sm font-bold text-blue-600">
                      {formatCurrency(finalTotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="px-4 py-2"></td>
                    <td className="px-4 py-2 text-right text-sm text-green-600 font-medium">Paid:</td>
                    <td className="px-4 py-2 text-right text-sm text-green-600 font-semibold">
                      {formatCurrency(paid)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="px-4 py-2"></td>
                    <td className="px-4 py-2 text-right text-sm font-medium">Change:</td>
                    <td className="px-4 py-2 text-right text-sm font-bold text-green-600">
                      {formatCurrency(change)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Remark */}
          {order.remark && (
            <div className="mt-4">
              <p className="text-xs text-gray-500">Remark</p>
              <p className="text-sm">{order.remark}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;