// components/pos/Receipt.jsx
import React from 'react';

const Receipt = React.forwardRef(({ order, shopInfo = {} }, ref) => {
  const shop = {
    name: shopInfo.name || 'POS SHOP',
    tel: shopInfo.tel || '012 345 678',
    address: shopInfo.address || 'Phnom Penh, Cambodia',
    ...shopInfo
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // ✅ ប្រើ Data ពី Backend ទាំងអស់
  const subtotal = order.subtotal || 0;
  const totalProductDiscount = order.total_product_discount || 0;
  const totalMemberDiscount = order.total_member_discount || 0;
  const totalDiscount = order.total_discount || 0;
  const finalTotal = order.total_amount || 0;
  const paid = order.paid || 0;
  const change = paid - finalTotal;

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
            <span>{formatDate(order.created_at || order.date || Date.now())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cashier:</span>
            <span>{order.cashier || 'Admin'}</span>
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
            const price = parseFloat(item.price) || 0;
            const productDiscount = parseFloat(item.discount) || 0;
            const memberDiscount = parseFloat(item.member_discount) || 0;
            const qty = item.qty || 0;
            const finalTotalItem = item.total || 0;
            
            return (
              <div key={index} className="text-[10px]">
                <div className="grid grid-cols-4 gap-1">
                  <span className="col-span-1 truncate font-medium">{item.product_name || item.name}</span>
                  <span className="text-center">{qty}</span>
                  <span className="text-right">${price.toFixed(2)}</span>
                  <span className="text-right font-bold">${finalTotalItem.toFixed(2)}</span>
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

        {/* Discount Breakdown - ប្រើ Data ពី Backend */}
        <div className="space-y-0.5 mb-2">
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {totalProductDiscount > 0 && (
            <div className="flex justify-between text-[10px] text-red-600">
              <span>Product Discount</span>
              <span>-${totalProductDiscount.toFixed(2)}</span>
            </div>
          )}
          {totalMemberDiscount > 0 && (
            <div className="flex justify-between text-[10px] text-green-600">
              <span>Member Discount</span>
              <span>-${totalMemberDiscount.toFixed(2)}</span>
            </div>
          )}
          {totalDiscount > 0 && (
            <div className="flex justify-between text-[10px] font-medium text-blue-600 border-b border-dashed border-gray-200 pb-1">
              <span>Total Discount</span>
              <span>-${totalDiscount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* ✅ Totals - ប្រើ Data ពី Backend (គ្មាន Tax) */}
        <div className="space-y-1">
          <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-300 pt-1.5">
            <span>TOTAL</span>
            <span className="text-blue-600">${finalTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-600">Paid</span>
            <span className="text-green-600 font-medium">${paid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-600">Change</span>
            <span className="text-green-600">${change.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-600">Payment</span>
            <span className="uppercase font-bold text-blue-600">{order.payment_method || 'Cash'}</span>
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