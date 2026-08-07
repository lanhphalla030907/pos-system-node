// components/pos/CheckoutModal.jsx - Responsive
import React, { useState } from 'react';
import CustomerSelect from './CustomerSelect';
import { calculateCartTotals } from '../../util/cartHelpers';
import { FiX, FiUser, FiCreditCard, FiDollarSign, FiCheckCircle } from 'react-icons/fi';

const CheckoutModal = ({
  isOpen,
  onClose,
  cart,
  onConfirm,
  loading,
  selectedCustomer,
  onCustomerSelect,
  memberDiscount = 0,
  customers,
  customersLoading,
  loadCustomers,
  addCustomer,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  
  const totals = calculateCartTotals(cart, memberDiscount);
  const totalAmount = totals.total;

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    const paid = parseFloat(paidAmount) || totalAmount;
    if (paid < totalAmount) {
      alert(`Paid amount ($${paid.toFixed(2)}) is less than total ($${totalAmount.toFixed(2)})`);
      return;
    }

    onConfirm({
      customer_id: selectedCustomer.id,
      payment_method: paymentMethod,
      paid_amount: paid,
    });
  };

  const change = (parseFloat(paidAmount) || 0) - totalAmount;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Checkout</h3>
            <p className="text-xs sm:text-sm text-gray-500">Complete your purchase</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Customer Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Customer
            </label>
            <CustomerSelect
              onSelect={onCustomerSelect}
              selectedCustomer={selectedCustomer}
              customers={customers}
              loading={customersLoading}
              loadCustomers={loadCustomers}
              addCustomer={addCustomer}
            />
            {memberDiscount > 0 && selectedCustomer && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-1.5 rounded-lg">
                <FiCheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Member Discount: {memberDiscount}% applied!
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Payment Method
            </label>
            <div className="relative">
              <FiCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white text-sm"
              >
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="mobile_payment">Mobile Payment</option>
              </select>
            </div>
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Paid Amount
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder={`Total: $${totalAmount.toFixed(2)}`}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white text-sm"
                step="0.01"
                min={totalAmount}
              />
            </div>
            <div className="flex justify-between text-xs mt-1.5">
              <span className="text-gray-500">Total: ${totalAmount.toFixed(2)}</span>
              <span className={change >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                Change: ${change >= 0 ? change.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-3 sm:pt-4">
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span className="text-gray-500">Items ({totals.totalItems})</span>
              <span className="text-gray-700">${totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.totalProductDiscount > 0 && (
              <div className="flex justify-between text-xs sm:text-sm text-red-500 mb-1">
                <span>Product Discount</span>
                <span>-${totals.totalProductDiscount.toFixed(2)}</span>
              </div>
            )}
            {totals.totalMemberDiscount > 0 && (
              <div className="flex justify-between text-xs sm:text-sm text-emerald-500 mb-1">
                <span>Member Discount</span>
                <span>-${totals.totalMemberDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base sm:text-lg font-bold border-t border-gray-200 pt-2 sm:pt-3 mt-2">
              <span className="text-gray-700">Total</span>
              <span className="text-black">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="inline-block animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                  <span className="text-xs sm:text-sm">Processing...</span>
                </div>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CheckoutModal);