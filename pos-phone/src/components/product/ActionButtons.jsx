// components/product/ActionButtons.jsx
import React from "react";

const ActionButtons = ({ row, onEdit, onDelete, editText = "Edit", deleteText = "Delete" }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onEdit(row)}
        className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 rounded-lg hover:bg-blue-50 transition"
      >
        {editText}
      </button>
      <button
        onClick={() => onDelete(row.id)}
        className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition"
      >
        {deleteText}
      </button>
    </div>
  );
};

export default ActionButtons;