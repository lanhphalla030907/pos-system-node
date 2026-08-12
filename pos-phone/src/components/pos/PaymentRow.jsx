// components/pos/PaymentRow.jsx
import React from 'react';
import { FiDollarSign, FiHash, FiTrash2, FiX } from 'react-icons/fi';
import PaymentMethodSelector from './PaymentMethodSelector';

const PaymentRow = ({
  row,
  index,
  paymentMethods,
  usedIds,
  onUpdate,
  onRemove,
  isRemovable,
  totalAmount,
}) => {
  const method = paymentMethods.find((m) => m.id === Number(row.payment_method_id));
  const needsReference = method?.type === 'mobile bank' || method?.type === 'card';

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            Payment {index + 1}
          </span>
          {row.isAutoFilled && (
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Auto</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onRemove(row.key)}
          disabled={!isRemovable}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Remove payment"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Payment Method Selector */}
      <PaymentMethodSelector
        paymentMethods={paymentMethods}
        selectedMethodId={row.payment_method_id}
        onSelect={(id) => onUpdate(row.key, 'payment_method_id', id)}
        disabled={false}
      />

      {/* Amount Input */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
          <FiDollarSign className="w-4 h-4" />
        </div>
        <input
          type="number"
          value={row.amount}
          onChange={(e) => onUpdate(row.key, 'amount', e.target.value)}
          placeholder="Amount"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white text-sm"
          step="0.01"
          min="0"
        />
        {totalAmount > 0 && (
          <button
            type="button"
            onClick={() => onUpdate(row.key, 'amount', totalAmount.toFixed(2))}
            className="text-xs text-blue-600 hover:text-blue-700 whitespace-nowrap"
          >
            Full
          </button>
        )}
      </div>

      {/* Reference Input */}
      {needsReference && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
            <FiHash className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={row.reference_no || ''}
            onChange={(e) => onUpdate(row.key, 'reference_no', e.target.value)}
            placeholder="Reference number (optional)"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default PaymentRow;