// components/pos/CartItem.jsx - Responsive
import React from 'react';
import ProductImage from '../product/ProductImage';
import { calculateProductDiscount } from '../../util/cartHelpers';
import { FiMinus, FiPlus, FiX } from 'react-icons/fi';

const CartItem = ({ item, onUpdateQuantity, onRemove, memberDiscount = 0 }) => {
  const calc = calculateProductDiscount(item, memberDiscount);
  const hasProductDiscount = parseFloat(item?.discount) > 0;
  const hasMemberDiscount = memberDiscount > 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3 mb-2 p-2 sm:p-2.5 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
      <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-100">
        <ProductImage 
          image={item?.image} 
          alt={item?.name} 
          size="sm"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{item?.name || 'Unnamed'}</p>
        <div className="flex items-center gap-1 flex-wrap mt-0.5">
          {(hasProductDiscount || hasMemberDiscount) ? (
            <>
              <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                ${parseFloat(item?.price || 0).toFixed(2)}
              </span>
              <span className="text-xs sm:text-sm font-bold text-black">
                ${calc.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-xs sm:text-sm font-bold text-black">
              ${parseFloat(item?.price || 0).toFixed(2)}
            </span>
          )}
          {hasProductDiscount && (
            <span className="text-[8px] sm:text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
              -{item.discount}%
            </span>
          )}
          {hasMemberDiscount && (
            <span className="text-[8px] sm:text-[10px] text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
              -{memberDiscount}%
            </span>
          )}
        </div>
        <div className="text-[8px] sm:text-[10px] text-gray-400">
          Total: ${calc.finalTotal.toFixed(2)}
        </div>
      </div>
      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          onClick={() => onUpdateQuantity(item.id, (item?.quantity || 0) - 1)}
          className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          <FiMinus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" />
        </button>
        <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-gray-700">
          {item?.quantity || 0}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.id, (item?.quantity || 0) + 1)}
          className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          <FiPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" />
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="ml-0.5 sm:ml-1 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <FiX className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default React.memo(CartItem);