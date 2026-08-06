// components/product/StatusBadge.jsx
import React from "react";

const StatusBadge = ({ status, activeText = "Active", inactiveText = "Inactive" }) => {
  const isActive = parseInt(status) === 1;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
        : 'bg-gray-50 text-gray-600 border border-gray-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        isActive ? 'bg-emerald-500' : 'bg-gray-400'
      }`}></span>
      {isActive ? activeText : inactiveText}
    </span>
  );
};

export default StatusBadge;