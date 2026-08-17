// store/settings.store.jsx - Global settings context
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { getSettings, updateSettings } from "../api/settingsApi";

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const res = await getSettings();
    if (res?.success) setSettings(res.data || {});
    return res;
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  const save = useCallback(async (data) => {
    const res = await updateSettings(data);
    if (res?.success) setSettings(res.data || {});
    return res;
  }, []);

  const value = useMemo(
    () => ({ settings, loading, reload, save }),
    [settings, loading, reload, save],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsStore = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(
      "useSettingsStore must be used within SettingsProvider",
    );
  }
  return context;
};
