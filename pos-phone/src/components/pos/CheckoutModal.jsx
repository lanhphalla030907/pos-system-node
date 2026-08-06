// components/pos/CheckoutModal.jsx
import React, { useState } from 'react';
import CustomerSelect from './CustomerSelect';
import { calculateCartTotals } from '../../util/cartHelpers';

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Checkout</h2>
        
        <div className="space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="text-xs text-green-600 mt-1">
                🎉 Member Discount: {memberDiscount}% applied!
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="mobile_payment">Mobile Payment</option>
            </select>
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid Amount
            </label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder={`Total: $${totalAmount.toFixed(2)}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              step="0.01"
              min={totalAmount}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Total: ${totalAmount.toFixed(2)}</span>
              <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                Change: ${change >= 0 ? change.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>

          {/* Order Summary - លុប Tax ចេញ */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Items ({totals.totalItems})</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.totalProductDiscount > 0 && (
              <div className="flex justify-between text-sm text-red-600 mb-1">
                <span>Product Discount</span>
                <span>-${totals.totalProductDiscount.toFixed(2)}</span>
              </div>
            )}
            {totals.totalMemberDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600 mb-1">
                <span>Member Discount</span>
                <span>-${totals.totalMemberDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold border-t border-gray-200 pt-2 mt-2">
              <span>Total</span>
              <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CheckoutModal);