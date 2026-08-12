// components/common/Alert.jsx - Highly Flexible & Reusable Alert Component
import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiInfo,
  FiX,
  FiBell,
  FiCheck,
  FiAlertTriangle,
} from 'react-icons/fi';

// 1. ALERT COMPONENT (Individual Alert)
const Alert = ({
  type = 'success',
  message = '',
  description = '',
  onClose,
  duration = 5000,
  position = 'top-right',
  showIcon = true,
  closable = true,
  icon = null,
  className = '',
  style = {},
  variant = 'solid', // 'solid', 'outline', 'subtle'
  size = 'md', // 'sm', 'md', 'lg'
  actions = null,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Auto close after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  // Configuration based on type
  const configs = {
    success: {
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      iconColor: 'text-emerald-500',
      icon: FiCheckCircle,
      title: 'Success',
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
      icon: FiXCircle,
      title: 'Error',
    },
    warning: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      iconColor: 'text-amber-500',
      icon: FiAlertTriangle,
      title: 'Warning',
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
      icon: FiInfo,
      title: 'Information',
    },
  };

  const config = configs[type] || configs.info;
  const IconComponent = icon || config.icon;

  // Variant styles
  const variantStyles = {
    solid: {
      background: config.bgColor,
      border: `border ${config.borderColor}`,
      shadow: 'shadow-lg',
    },
    outline: {
      background: 'bg-white',
      border: `border-2 ${config.borderColor}`,
      shadow: 'shadow-sm',
    },
    subtle: {
      background: 'bg-white',
      border: `border ${config.borderColor}`,
      shadow: 'none',
    },
  };

  // Size styles
  const sizeStyles = {
    sm: {
      padding: 'p-3',
      textSize: 'text-xs',
      iconSize: 'w-4 h-4',
      titleSize: 'text-xs',
      descriptionSize: 'text-xs',
    },
    md: {
      padding: 'p-4',
      textSize: 'text-sm',
      iconSize: 'w-5 h-5',
      titleSize: 'text-sm',
      descriptionSize: 'text-sm',
    },
    lg: {
      padding: 'p-5',
      textSize: 'text-base',
      iconSize: 'w-6 h-6',
      titleSize: 'text-base',
      descriptionSize: 'text-sm',
    },
  };

  const sizeConfig = sizeStyles[size] || sizeStyles.md;

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
  };

  const currentVariant = variantStyles[variant] || variantStyles.solid;

  return (
    <div 
      className={`
        fixed z-50 
        ${positionClasses[position]} 
        max-w-md w-full 
        ${isExiting ? 'animate-slideOut' : 'animate-slideIn'}
        ${currentVariant.background} 
        ${currentVariant.border} 
        ${currentVariant.shadow}
        rounded-xl 
        ${sizeConfig.padding}
        ${className}
      `}
      style={style}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        {showIcon && (
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            <IconComponent className={sizeConfig.iconSize} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold ${config.textColor} ${sizeConfig.titleSize}`}>
            {message || config.title}
          </p>
          {description && (
            <p className={`${config.textColor} opacity-80 mt-0.5 ${sizeConfig.descriptionSize}`}>
              {description}
            </p>
          )}
          {actions && (
            <div className="mt-3 flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>

        {/* Close Button */}
        {closable && (
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ${config.textColor} opacity-60 hover:opacity-100 transition-opacity`}
            aria-label="Close alert"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {duration > 0 && variant !== 'subtle' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-xl overflow-hidden">
          <div
            className={`h-full ${config.iconColor} bg-current`}
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(30px);
          }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        .animate-slideOut {
          animation: slideOut 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

// 2. ALERT PROVIDER & CONTEXT
const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((alertConfig) => {
    const id = Date.now() + Math.random();
    const newAlert = {
      id,
      ...alertConfig,
      onClose: () => {
        hideAlert(id);
        if (alertConfig.onClose) alertConfig.onClose();
      },
    };
    setAlerts((prev) => [...prev, newAlert]);

    // Auto remove after duration
    if (alertConfig.duration !== 0) {
      setTimeout(() => {
        hideAlert(id);
      }, alertConfig.duration || 5000);
    }

    return id;
  }, []);

  const hideAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Helper methods for common alert types
  const success = useCallback((message, options = {}) => {
    return showAlert({ type: 'success', message, ...options });
  }, [showAlert]);

  const error = useCallback((message, options = {}) => {
    return showAlert({ type: 'error', message, ...options });
  }, [showAlert]);

  const warning = useCallback((message, options = {}) => {
    return showAlert({ type: 'warning', message, ...options });
  }, [showAlert]);

  const info = useCallback((message, options = {}) => {
    return showAlert({ type: 'info', message, ...options });
  }, [showAlert]);

  const promise = useCallback(async (promiseFn, options = {}) => {
    const { loading, success, error: errorMsg } = options;
    
    // Show loading alert
    const loadingId = showAlert({
      type: 'info',
      message: loading || 'Processing...',
      description: 'Please wait...',
      duration: 0,
      closable: false,
    });

    try {
      const result = await promiseFn();
      hideAlert(loadingId);
      
      // Show success alert
      if (success !== false) {
        showAlert({
          type: 'success',
          message: success || 'Operation completed successfully!',
          ...options.successOptions,
        });
      }
      
      return result;
    } catch (error) {
      hideAlert(loadingId);
      
      // Show error alert
      showAlert({
        type: 'error',
        message: errorMsg || 'Operation failed',
        description: error.message || 'Please try again.',
        ...options.errorOptions,
      });
      
      throw error;
    }
  }, [showAlert, hideAlert]);

  const value = useMemo(() => ({
    showAlert,
    hideAlert,
    clearAlerts,
    success,
    error,
    warning,
    info,
    promise,
    alerts,
  }), [showAlert, hideAlert, clearAlerts, success, error, warning, info, promise, alerts]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md w-full pointer-events-none">
        {alerts.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <Alert {...alert} />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

// 3. CUSTOM HOOK
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

// 4. STANDALONE ALERT (Without Provider)
export const showAlert = (config) => {
  // Create a temporary div to render the alert
  const container = document.createElement('div');
  document.body.appendChild(container);

  const close = () => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  // Render the alert
  const alertElement = (
    <Alert
      {...config}
      onClose={() => {
        if (config.onClose) config.onClose();
        close();
      }}
    />
  );

  // Use ReactDOM to render
  const { createRoot } = require('react-dom/client');
  const root = createRoot(container);
  root.render(alertElement);

  return { close };
};

// 5. USAGE EXAMPLES

/*
// 1. Basic Usage with Provider
// Wrap your app in App.js
import { AlertProvider } from './components/common/Alert';

function App() {
  return (
    <AlertProvider>
      <YourApp />
    </AlertProvider>
  );
}

// 2. Use in component
import { useAlert } from './components/common/Alert';

function MyComponent() {
  const alert = useAlert();

  // Simple success
  const handleSuccess = () => {
    alert.success('Role created successfully!');
  };

  // With description
  const handleSuccessWithDesc = () => {
    alert.success('Role created successfully!', {
      description: 'The role has been added to the system.',
      duration: 3000,
    });
  };

  // Error
  const handleError = () => {
    alert.error('Failed to create role', {
      description: 'Please check your connection and try again.',
    });
  };

  // Warning
  const handleWarning = () => {
    alert.warning('Low stock alert', {
      description: '5 products are running low on stock.',
    });
  };

  // Info
  const handleInfo = () => {
    alert.info('New update available', {
      description: 'Version 2.0 is now available.',
    });
  };

  // Custom alert
  const handleCustom = () => {
    alert.showAlert({
      type: 'success',
      message: 'Custom Alert',
      description: 'This is a custom alert with actions',
      duration: 8000,
      position: 'bottom-right',
      variant: 'outline',
      size: 'lg',
      actions: (
        <button className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700">
          View Details
        </button>
      ),
    });
  };

  // API call with loading state
  const handleApiCall = async () => {
    try {
      await alert.promise(
        async () => {
          const response = await fetch('/api/roles', {
            method: 'POST',
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error('Failed to create role');
          return response.json();
        },
        {
          loading: 'Creating role...',
          success: 'Role created successfully!',
          error: 'Failed to create role',
        }
      );
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="space-y-2">
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      <button onClick={handleWarning}>Warning</button>
      <button onClick={handleInfo}>Info</button>
      <button onClick={handleCustom}>Custom</button>
      <button onClick={handleApiCall}>API Call</button>
    </div>
  );
}

// 3. Standalone usage (without Provider)
import { showAlert } from './components/common/Alert';

const handleStandalone = () => {
  showAlert({
    type: 'success',
    message: 'Standalone Alert',
    description: 'This works without AlertProvider',
    duration: 3000,
  });
};

// 4. API integration example
const createRoleAPI = async (data, alert) => {
  try {
    const result = await alert.promise(
      async () => {
        const response = await request('role', 'post', data);
        if (!response.success) throw new Error(response.message);
        return response;
      },
      {
        loading: 'Creating role...',
        success: `Role "${data.name}" created successfully!`,
        error: 'Failed to create role',
        errorOptions: {
          description: 'Please check your input and try again.',
        },
      }
    );
    return result;
  } catch (error) {
    // Already handled by alert.promise
    throw error;
  }
};
*/

// 6. EXPORT
export default Alert;