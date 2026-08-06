// components/employee/EmployeeImage.jsx
import React from 'react';
import { Config } from '../../util/config';

const EmployeeImage = ({ image, name, size = 'sm', className = '' }) => {
  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-3xl',
  };

  const sizeClass = sizes[size] || sizes.sm;

  // If no image, show initials
  if (!image) {
    return (
      <div className={`${sizeClass} rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold ${className}`}>
        {name?.charAt(0)?.toUpperCase() || '?'}
      </div>
    );
  }

  // Build image URL
  const imageUrl = image.startsWith('http') || image.startsWith('data:') 
    ? image 
    : `${Config.base_url2}uploads/employee/${image}`;

  return (
    <img
      src={imageUrl}
      alt={name || 'Employee'}
      className={`${sizeClass} rounded-full object-cover border border-gray-200 ${className}`}
      onError={(e) => {
        e.target.onerror = null;
        e.target.style.display = 'none';
        const parent = e.target.parentElement;
        const fallback = document.createElement('div');
        fallback.className = `${sizeClass} rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold ${className}`;
        fallback.textContent = name?.charAt(0)?.toUpperCase() || '?';
        parent.appendChild(fallback);
      }}
    />
  );
};

export default EmployeeImage;