// components/pos/ProductCard.jsx - Fixed with smaller image height
import React from 'react';
import ProductImage from '../product/ProductImage';
import { FiBox } from 'react-icons/fi';

const ProductCard = ({ product, onClick, memberDiscount = 0 }) => {
  const stock = parseInt(product?.qty) || 0;
  const isOutOfStock = stock === 0;
  
  const price = parseFloat(product.price) || 0;
  const productDiscount = parseFloat(product.discount) || 0;
  const productDiscountAmount = (price * productDiscount) / 100;
  const afterProductDiscount = price - productDiscountAmount;
  const memberDiscountAmount = (afterProductDiscount * memberDiscount) / 100;
  const finalPrice = price - productDiscountAmount - memberDiscountAmount;
  const hasProductDiscount = productDiscount > 0;
  const hasMemberDiscount = memberDiscount > 0;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all cursor-pointer
        ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'}
        overflow-hidden
      `}
    >
      <div className="relative">
        {/* Reduced height from aspect-square to fixed height */}
        <div className="w-full h-24 sm:h-28 md:h-32 bg-gray-100">
          <ProductImage 
            image={product?.image} 
            alt={product?.name} 
            size="md"
            className="w-full h-full object-cover"
          />
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium text-[8px] sm:text-xs bg-black/80 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {stock > 0 && stock <= 5 && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-amber-500 text-white text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
            Low Stock
          </div>
        )}
        {hasProductDiscount && !isOutOfStock && (
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-500 text-white text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
            -{product.discount}%
          </div>
        )}
        {hasMemberDiscount && !isOutOfStock && memberDiscount > 0 && (
          <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-emerald-500 text-white text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
            Member {memberDiscount}%
          </div>
        )}
      </div>
      
      <div className="p-1.5 sm:p-2 md:p-3">
        <h3 className="font-medium text-gray-800 text-[10px] sm:text-xs md:text-sm truncate">
          {product?.name || 'Unnamed'}
        </h3>
        <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 truncate">
          {product?.category_name || 'Uncategorized'}
        </p>
        <div className="flex items-center justify-between mt-1 sm:mt-2">
          <div>
            {(hasProductDiscount || hasMemberDiscount) ? (
              <>
                <span className="text-[8px] sm:text-[10px] text-gray-400 line-through">
                  ${price.toFixed(2)}
                </span>
                <span className="text-xs sm:text-sm md:text-base font-bold text-black block">
                  ${finalPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-xs sm:text-sm md:text-base font-bold text-black">
                ${price.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <FiBox className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
            <span className={`text-[8px] sm:text-xs ${stock > 0 ? 'text-gray-600' : 'text-red-500'}`}>
              {stock}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);