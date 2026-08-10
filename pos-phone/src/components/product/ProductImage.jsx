// components/product/ProductImage.jsx
import React from "react";
import { Config } from "../../util/config";

const ProductImage = ({ image, alt, size = "md", className = "" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const sizeClass = sizes[size] || sizes.md;

  if (!image) {
    return (
      <div className={`${sizeClass} bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 ${className}`}>
        <svg className="w-1/2 h-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const imageUrl = image.startsWith('http') 
    ? image 
    : `${Config.base_url2}uploads/products/${image}`;

  return (
    <img
      src={imageUrl}
      alt={alt || "Product"}
      className={`${sizeClass} rounded-lg border border-gray-200 ${className}`}
      onError={(e) => {
        e.target.onerror = null;
        e.target.style.display = 'none';
      }}
    />
  );
};

export default ProductImage;