// components/pos/CartItem.jsx
import React from 'react';
import ProductImage from '../product/ProductImage';
import { calculateProductDiscount } from '../../util/cartHelpers';

const CartItem = ({ item, onUpdateQuantity, onRemove, memberDiscount = 0 }) => {
  const calc = calculateProductDiscount(item, memberDiscount);
  const hasProductDiscount = parseFloat(item?.discount) > 0;
  const hasMemberDiscount = memberDiscount > 0;

  return (
    <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
      <div className="w-10 h-10 flex-shrink-0">
        <ProductImage 
          image={item?.image} 
          alt={item?.name} 
          size="sm"
          className="w-full h-full object-cover rounded"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">{item?.name || 'Unnamed'}</p>
        <div className="flex items-center gap-1">
          {(hasProductDiscount || hasMemberDiscount) ? (
            <>
              <span className="text-[10px] text-gray-400 line-through">
                ${parseFloat(item?.price || 0).toFixed(2)}
              </span>
              <span className="text-[10px] font-bold text-blue-600">
                ${calc.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-[10px] font-bold text-blue-600">
              ${parseFloat(item?.price || 0).toFixed(2)}
            </span>
          )}
          {hasMemberDiscount && (
            <span className="text-[8px] text-green-600 bg-green-50 px-1 rounded">
              -{memberDiscount}%
            </span>
          )}
          {hasProductDiscount && (
            <span className="text-[8px] text-red-600 bg-red-50 px-1 rounded">
              -{item.discount}%
            </span>
          )}
        </div>
        <div className="text-[8px] text-gray-400">
          Subtotal: ${calc.subtotal.toFixed(2)} → ${calc.finalTotal.toFixed(2)}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateQuantity(item.id, (item?.quantity || 0) - 1)}
          className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 text-xs"
        >
          -
        </button>
        <span className="w-6 text-center text-xs">{item?.quantity || 0}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, (item?.quantity || 0) + 1)}
          className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 text-xs"
        >
          +
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="ml-0.5 text-red-500 hover:text-red-700"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default React.memo(CartItem);