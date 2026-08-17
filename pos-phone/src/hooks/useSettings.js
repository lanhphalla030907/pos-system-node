// hooks/useSettings.js
import { useState, useCallback } from "react";
import {
  getSettings,
  updateSettings,
  uploadLogo,
} from "../api/settingsApi";

export const useSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSettings();
      if (res?.success) {
        setSettings(res.data || {});
      } else {
        setSettings({});
      }
      return res;
    } catch (error) {
      console.error("Error loading settings:", error);
      setError(error.message);
      setSettings({});
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updateSettings(data);
      if (res?.success) {
        setSettings(res.data || {});
      }
      return res;
    } catch (error) {
      console.error("Error saving settings:", error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const saveLogo = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);
      return await uploadLogo(file);
    } catch (error) {
      console.error("Error uploading logo:", error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    settings,
    loading,
    error,
    loadSettings,
    saveSettings,
    saveLogo,
    clearError,
  };
};
