// components/pos/Cart.jsx
import React from 'react';
import CartItem from './CartItem';
import { calculateCartTotals } from '../../util/cartHelpers';

const Cart = ({ cart, onUpdateQuantity, onRemove, onClear, onCheckout, memberDiscount = 0 }) => {
  const totals = calculateCartTotals(cart, memberDiscount);

  return (
    <div className="w-80 bg-white shadow-lg flex flex-col border-l border-gray-200 flex-shrink-0">
      {/* Cart Header */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Cart</h2>
            <p className="text-xs text-gray-500">{totals.totalItems} items</p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>
        {memberDiscount > 0 && cart.length > 0 && (
          <div className="mt-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded inline-block">
            🎉 Member {memberDiscount}% off
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-sm text-center">Cart is empty</p>
            <p className="text-xs">Click products to add</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
              memberDiscount={memberDiscount}
            />
          ))
        )}
      </div>

      {/* Cart Summary - ✅ លុប Tax ចេញ */}
      {cart.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.totalProductDiscount > 0 && (
              <div className="flex justify-between text-xs text-red-600">
                <span>Product Discount</span>
                <span> -${totals.totalProductDiscount.toFixed(2)}</span>
              </div>
            )}
            {totals.totalMemberDiscount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Member Discount</span>
                <span> -${totals.totalMemberDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-1.5">
              <span>Total</span>
              <span className="text-blue-600">${totals.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(Cart);