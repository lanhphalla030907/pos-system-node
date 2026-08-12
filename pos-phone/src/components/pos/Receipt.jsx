import React from 'react';
import { formatDate } from '../../util/orderHelper';

const Receipt = React.forwardRef(({ order, shopInfo = {} }, ref) => {
  const shop = {
    name: shopInfo.name || 'Library AhLaTaLorkBek',
    tel: shopInfo.tel || '0962657233',
    address: shopInfo.address || 'Phnom Penh, Cambodia',
    ...shopInfo
  };

  const subtotal = order.subtotal || 0;
  const totalProductDiscount = order.total_product_discount || 0;
  const totalMemberDiscount = order.total_member_discount || 0;
  const totalDiscount = order.total_discount || 0;
  const finalTotal = order.total_amount || 0;
  const paid = order.paid || 0;
  const change = paid - finalTotal;

  // Safe format function
  const safeFormat = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  return (
    <div ref={ref} className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 w-[340px] text-xs font-mono shadow-lg rounded-lg">
        {/* Shop Header */}
        <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
          <h2 className="font-bold text-lg uppercase tracking-wider">{shop.name}</h2>
          <p className="text-[10px] text-gray-600">Tel: {shop.tel}</p>
          <p className="text-[10px] text-gray-600">{shop.address}</p>
        </div>

        {/* Order Info */}
        <div className="space-y-0.5 mb-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Order No:</span>
            <span className="font-bold">{order.order_no}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span>{formatDate(order.created_at || order.create_at || Date.now())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cashier:</span>
            <span>{order.cashier_name || order.cashier || 'Admin'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">{order.customer_name || 'Walk-in Customer'}</span>
          </div>
          {order.customer_tel && (
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span>{order.customer_tel}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-gray-300 my-3"></div>

        {/* Items Header */}
        <div className="grid grid-cols-4 gap-1 font-bold text-[10px] mb-2 text-gray-700 border-b border-gray-200 pb-1">
          <span className="col-span-1">Item</span>
          <span className="text-center">Qty</span>
          <span className="text-right">Price</span>
          <span className="text-right">Total</span>
        </div>

        {/* Items */}
        <div className="space-y-1.5 mb-3">
          {order.items?.map((item, index) => {
            //  FIX: Convert all values to numbers
            const price = parseFloat(item.price) || 0;
            const productDiscount = parseFloat(item.discount) || 0;
            const memberDiscount = parseFloat(item.member_discount) || 0;
            const qty = parseFloat(item.qty) || 0;
            //  Use item.total from backend or calculate
            const finalTotalItem = parseFloat(item.total) || (price * qty);

            return (
              <div key={index} className="text-[10px]">
                <div className="grid grid-cols-4 gap-1">
                  <span className="col-span-1 truncate font-medium">{item.product_name || item.name}</span>
                  <span className="text-center">{qty}</span>
                  <span className="text-right">${safeFormat(price)}</span>
                  <span className="text-right font-bold">${safeFormat(finalTotalItem)}</span>
                </div>
                {(productDiscount > 0 || memberDiscount > 0) && (
                  <div className="text-[8px] text-gray-400 pl-1 flex gap-2">
                    {productDiscount > 0 && <span>Product: -{productDiscount}%</span>}
                    {memberDiscount > 0 && <span>Member: -{memberDiscount}%</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-dashed border-gray-300 my-3"></div>

        {/* Discount Breakdown */}
        <div className="space-y-0.5 mb-2">
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>Subtotal</span>
            <span>${safeFormat(subtotal)}</span>
          </div>
          {totalProductDiscount > 0 && (
            <div className="flex justify-between text-[10px] text-red-600">
              <span>Product Discount</span>
              <span>-${safeFormat(totalProductDiscount)}</span>
            </div>
          )}
          {totalMemberDiscount > 0 && (
            <div className="flex justify-between text-[10px] text-green-600">
              <span>Member Discount</span>
              <span>-${safeFormat(totalMemberDiscount)}</span>
            </div>
          )}
          {totalDiscount > 0 && (
            <div className="flex justify-between text-[10px] font-medium text-blue-600 border-b border-dashed border-gray-200 pb-1">
              <span>Total Discount</span>
              <span>-${safeFormat(totalDiscount)}</span>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-300 pt-1.5">
            <span>TOTAL</span>
            <span className="text-blue-600">${safeFormat(finalTotal)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-600">Paid</span>
            <span className="text-green-600 font-medium">${safeFormat(paid)}</span>
          </div>
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-600">Change</span>
            <span className="text-green-600">${safeFormat(change)}</span>
          </div>
          <div className="text-[10px] space-y-0.5 border-t border-dashed border-gray-200 pt-1">
            <div className="text-gray-600 font-bold mb-0.5">Payment</div>
            {(order.payments && order.payments.length > 0) ? (
              order.payments.map((payment, index) => (
                <div key={index} className="flex justify-between">
                  <span>{payment.payment_method}</span>
                  <span className="uppercase font-bold text-blue-600">${safeFormat(payment.amount)}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-between">
                <span className="text-gray-600">Payment</span>
                <span className="uppercase font-bold text-blue-600">{order.payment_method || 'Cash'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-dashed border-gray-300 my-3"></div>

        {/* Footer */}
        <div className="text-center text-[10px] space-y-0.5">
          <p className="font-medium text-gray-800">Thank you for your purchase!</p>
          <p className="text-[8px] text-gray-500">Please come again</p>
          {order.order_no && (
            <p className="text-[8px] text-gray-400 mt-1">Order: {order.order_no}</p>
          )}
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

export default Receipt;