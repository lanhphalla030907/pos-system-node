
import React from 'react';
import {
  FiAlertTriangle,
  FiX,
  FiTrash2,
  FiLogOut,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger', 'warning', 'info', 'success'
  icon = null,
  loading = false,
  className = '',
}) => {
  if (!isOpen) return null;

  // Configuration based on type
  const configs = {
    danger: {
      icon: FiAlertTriangle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      confirmColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      titleColor: 'text-red-800',
    },
    warning: {
      icon: FiAlertCircle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      confirmColor: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
      titleColor: 'text-amber-800',
    },
    info: {
      icon: FiCheckCircle,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      confirmColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      titleColor: 'text-blue-800',
    },
    success: {
      icon: FiCheckCircle,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      confirmColor: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
      titleColor: 'text-emerald-800',
    },
  };

  const config = configs[type] || configs.danger;
  const IconComponent = icon || config.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`
            relative bg-white rounded-xl shadow-2xl max-w-md w-full 
            transform transition-all animate-modalIn
            ${className}
          `}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className={`flex items-center justify-center w-16 h-16 rounded-full ${config.bgColor} mx-auto mb-4`}>
              <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
            </div>

            {/* Title */}
            <h3 className={`text-lg font-semibold text-center ${config.titleColor} mb-2`}>
              {title}
            </h3>

            {/* Message */}
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              {message}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`
                  flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-lg 
                  transition-all shadow-sm hover:shadow-md
                  focus:ring-2 focus:ring-offset-2
                  ${config.confirmColor}
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                `}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modalIn {
          animation: modalIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;