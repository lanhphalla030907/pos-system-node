// components/pos/Cart.jsx - Responsive with close button
import React from 'react';
import CartItem from './CartItem';
import { calculateCartTotals } from '../../util/cartHelpers';
import { FiShoppingCart, FiTrash2, FiCheckCircle, FiTag, FiX } from 'react-icons/fi';

const Cart = ({ cart, onUpdateQuantity, onRemove, onClear, onCheckout, memberDiscount = 0, onClose }) => {
  const totals = calculateCartTotals(cart, memberDiscount);

  return (
    <div className="w-full md:w-80 bg-white shadow-lg flex flex-col border-l border-gray-200 h-full">
      {/* Cart Header */}
      <div className="px-3 sm:px-4 py-3 border-b border-gray-200 flex-shrink-0 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiShoppingCart className="w-4 h-4 text-gray-600" />
            <div>
              <h2 className="text-sm font-medium text-gray-800">Cart</h2>
              <p className="text-xs text-gray-400">{totals.totalItems} items</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <FiTrash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {memberDiscount > 0 && cart.length > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
            <FiTag className="w-3 h-3" />
            Member {memberDiscount}% off
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FiShoppingCart className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Cart is empty</p>
            <p className="text-xs text-gray-400 mt-1 text-center px-4">Click products to add</p>
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

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="px-3 sm:px-4 py-3 border-t border-gray-200 bg-gray-50/50 flex-shrink-0">
          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-700">${totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.totalProductDiscount > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>Product Discount</span>
                <span>-${totals.totalProductDiscount.toFixed(2)}</span>
              </div>
            )}
            {totals.totalMemberDiscount > 0 && (
              <div className="flex justify-between text-sm text-emerald-500">
                <span>Member Discount</span>
                <span>-${totals.totalMemberDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-700">Total</span>
              <span className="text-black">${totals.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            className="w-full px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-all font-medium text-sm shadow-sm flex items-center justify-center gap-2"
          >
            <FiCheckCircle className="w-4 h-4" />
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(Cart);