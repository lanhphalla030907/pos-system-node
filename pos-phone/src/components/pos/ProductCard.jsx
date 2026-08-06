// components/pos/ProductCard.jsx
import React from 'react';
import ProductImage from '../product/ProductImage';
import { getDiscountedPrice } from '../../util/cartHelpers';

const ProductCard = ({ product, onClick, memberDiscount = 0 }) => {
  const stock = parseInt(product?.qty) || 0;
  const isOutOfStock = stock === 0;
  
  // Calculate price with both discounts
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
        bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer
        ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:border-blue-500'}
        border-2 border-transparent overflow-hidden
      `}
    >
      <div className="relative">
        <div className="w-full h-28 bg-gray-100">
          <ProductImage 
            image={product?.image} 
            alt={product?.name} 
            size="md"
            className="w-full h-full object-cover"
          />
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-xs bg-red-600 px-2 py-0.5 rounded">
              Out of Stock
            </span>
          </div>
        )}
        {stock > 0 && stock <= 5 && (
          <div className="absolute top-1 right-1 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            Low Stock
          </div>
        )}
        {hasProductDiscount && !isOutOfStock && (
          <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {product.discount}% OFF
          </div>
        )}
       
      </div>
      
      <div className="p-2">
        <h3 className="font-semibold text-gray-800 text-xs truncate">
          {product?.name || 'Unnamed'}
        </h3>
        <p className="text-[10px] text-gray-500 truncate">
          {product?.category_name || 'Uncategorized'}
        </p>
        <div className="flex items-center justify-between mt-1">
          <div>
            {(hasProductDiscount || hasMemberDiscount) ? (
              <>
                <span className="text-[10px] text-gray-400 line-through">
                  ${price.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-blue-600 block">
                  ${finalPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-blue-600">
                ${price.toFixed(2)}
              </span>
            )}
          </div>
          <span className={`text-[10px] ${stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {stock} Units
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);