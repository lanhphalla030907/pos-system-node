// hooks/useConfirm.js
import { useState, useCallback } from 'react';

export const useConfirm = () => {
  const [config, setConfig] = useState({
    isOpen: false,
    title: 'Are you sure?',
    message: 'This action cannot be undone.',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    icon: null,
    onConfirm: null,
    onCancel: null,
    loading: false,
  });

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfig({
        isOpen: true,
        title: options.title || 'Are you sure?',
        message: options.message || 'This action cannot be undone.',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'danger',
        icon: options.icon || null,
        onConfirm: () => {
          if (options.onConfirm) {
            options.onConfirm();
          }
          resolve(true);
          setConfig(prev => ({ ...prev, isOpen: false }));
        },
        onCancel: () => {
          if (options.onCancel) {
            options.onCancel();
          }
          resolve(false);
          setConfig(prev => ({ ...prev, isOpen: false }));
        },
        loading: false,
      });
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  const setLoading = useCallback((loading) => {
    setConfig(prev => ({ ...prev, loading }));
  }, []);

  // Return config and functions - NO JSX
  return {
    showConfirm,
    closeConfirm,
    setLoading,
    config, // Return config so component can render the modal
    confirm: showConfirm, // Alias for backward compatibility
  };
};

export default useConfirm;