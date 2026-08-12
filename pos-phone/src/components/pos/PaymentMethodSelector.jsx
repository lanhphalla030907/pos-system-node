// components/pos/PaymentMethodSelector.jsx
import React from 'react';
import { FiCreditCard, FiDollarSign, FiPhone, FiCheck } from 'react-icons/fi';

const PaymentMethodSelector = ({
  paymentMethods,
  selectedMethodId,
  onSelect,
  disabled = false,
}) => {
  const getMethodIcon = (method) => {
    if (method.icon) {
      return <img src={method.icon} alt={method.name} className="w-6 h-6 object-contain" />;
    }
    switch (method.type) {
      case 'mobile bank': return <FiPhone className="w-5 h-5" />;
      case 'card': return <FiCreditCard className="w-5 h-5" />;
      default: return <FiDollarSign className="w-5 h-5" />;
    }
  };

  const getMethodColor = (method) => {
    switch (method.type) {
      case 'mobile bank': return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'card': return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      default: return 'border-green-200 bg-green-50 hover:bg-green-100';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {paymentMethods.map((method) => {
        const isSelected = selectedMethodId === method.id;
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            disabled={disabled}
            className={`
              relative p-3 rounded-lg border-2 text-left transition-all
              ${isSelected 
                ? 'border-black bg-gray-50 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center gap-2">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}
              `}>
                {getMethodIcon(method)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isSelected ? 'text-black' : 'text-gray-700'}`}>
                  {method.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {method.type || 'Payment'}
                </p>
              </div>
            </div>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black flex items-center justify-center">
                <FiCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PaymentMethodSelector;