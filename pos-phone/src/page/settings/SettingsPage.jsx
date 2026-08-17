// pages/settings/SettingsPage.jsx
import { useState, useEffect, useRef } from "react";
import { useSettingsStore } from "../../store/settings.store";
import { uploadLogo } from "../../api/settingsApi";
import { useAlert } from "../../components/common/Alert";
import { Config } from "../../util/config";
import {
  FiSettings,
  FiSave,
  FiUpload,
  FiX,
  FiHome,
  FiFileText,
  FiBell,
  FiShield,
  FiPhone,
  FiMail,
  FiGlobe,
  FiDollarSign,
} from "react-icons/fi";

const TABS = [
  { key: "general", label: "General", icon: <FiSettings className="w-4 h-4" /> },
  { key: "store", label: "Store Info", icon: <FiHome className="w-4 h-4" /> },
  { key: "receipt", label: "Receipt", icon: <FiFileText className="w-4 h-4" /> },
  { key: "notifications", label: "Notifications", icon: <FiBell className="w-4 h-4" /> },
  { key: "security", label: "Security", icon: <FiShield className="w-4 h-4" /> },
];

const FIELD_CONFIGS = {
  general: [
    {
      key: "store_name",
      label: "Store Name",
      type: "text",
      required: true,
      icon: <FiHome className="w-4 h-4" />,
    },
    {
      key: "currency",
      label: "Currency",
      type: "select",
      options: ["USD", "KHR"],
      icon: <FiDollarSign className="w-4 h-4" />,
    },
    {
      key: "currency_rate",
      label: "Exchange Rate (1 USD = ?)",
      type: "number",
      placeholder: "4000",
      description: "Used to convert prices to KHR when currency is set to KHR",
      icon: <FiDollarSign className="w-4 h-4" />,
    },
    { key: "tax_rate", label: "Tax Rate (%)", type: "number", placeholder: "0" },
    {
      key: "default_language",
      label: "Default Language",
      type: "select",
      options: ["English", "Khmer"],
      icon: <FiGlobe className="w-4 h-4" />,
    },
    { key: "timezone", label: "Timezone", type: "text", placeholder: "e.g. Asia/Phnom_Penh" },
    {
      key: "low_stock_threshold",
      label: "Low Stock Threshold",
      type: "number",
      placeholder: "5",
    },
  ],
  store: [
    { key: "store_logo", label: "Store Logo", type: "logo" },
    { key: "store_phone", label: "Phone", type: "text", icon: <FiPhone className="w-4 h-4" /> },
    { key: "store_email", label: "Email", type: "email", icon: <FiMail className="w-4 h-4" /> },
    { key: "store_address", label: "Address", type: "text" },
    { key: "business_registration", label: "Business Registration No.", type: "text" },
    { key: "store_description", label: "Description", type: "textarea" },
  ],
  receipt: [
    { key: "receipt_header", label: "Receipt Header", type: "text", placeholder: "Thank you for shopping with us!" },
    { key: "receipt_footer", label: "Receipt Footer", type: "text", placeholder: "Have a nice day!" },
    { key: "receipt_show_logo", label: "Show Logo on Receipt", type: "switch" },
    { key: "receipt_show_tax", label: "Show Tax", type: "switch" },
    { key: "receipt_show_discount", label: "Show Discount", type: "switch" },
    { key: "receipt_show_change", label: "Show Change", type: "switch" },
  ],
  notifications: [
    { key: "telegram_enabled", label: "Enable Telegram Notifications", type: "switch" },
    { key: "telegram_bot_token", label: "Telegram Bot Token", type: "text", password: true, placeholder: "123456:ABC-DEF..." },
    { key: "telegram_chat_id", label: "Telegram Chat ID", type: "text", placeholder: "e.g. -1001234567890" },
    { key: "low_stock_alert", label: "Low Stock Alerts", type: "switch" },
    { key: "sale_alert", label: "Sale Alerts", type: "switch" },
  ],
  security: [
    { key: "allow_registration", label: "Allow User Registration", type: "switch" },
    { key: "session_timeout_minutes", label: "Session Timeout (minutes)", type: "number", placeholder: "60" },
    { key: "max_login_attempts", label: "Max Login Attempts", type: "number", placeholder: "5" },
  ],
};

const Input = ({ config, value, onChange }) => {
  if (config.type === "switch") {
    const checked = value === "1" || value === 1 || value === true;
    return (
      <div>
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {config.label}
            </label>
            {config.description && (
              <p className="text-xs text-gray-400 mt-0.5">{config.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange(config.key, checked ? "0" : "1")}
            className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
              checked ? "bg-gray-900" : "bg-gray-200"
            }`}
            aria-pressed={checked}
          >
            <span
              className={`inline-block w-4 h-4 transform rounded-full bg-white shadow transition-transform ${
                checked ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    );
  }

  if (config.type === "select") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {config.label}
        </label>
        <div className="relative">
          {config.icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              {config.icon}
            </span>
          )}
          <select
            value={value || ""}
            onChange={(e) => onChange(config.key, e.target.value)}
            className={`w-full text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white px-3.5 py-2.5 border-gray-200 ${
              config.icon ? "pl-10" : ""
            }`}
          >
            <option value="">Select...</option>
            {config.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (config.type === "textarea") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {config.label}
        </label>
        <textarea
          rows={3}
          value={value || ""}
          onChange={(e) => onChange(config.key, e.target.value)}
          placeholder={config.placeholder}
          className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {config.label}
        {config.required && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative">
        {config.icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            {config.icon}
          </span>
        )}
        <input
          type={config.password ? "password" : config.type || "text"}
          value={value || ""}
          onChange={(e) => onChange(config.key, e.target.value)}
          placeholder={config.placeholder}
          className={`w-full text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white px-3.5 py-2.5 border-gray-200 ${
            config.icon ? "pl-10" : ""
          }`}
        />
      </div>
      {config.description && (
        <p className="text-xs text-gray-400 mt-1">{config.description}</p>
      )}
    </div>
  );
};

const LogoField = ({ value, onChange, onUpload, uploading }) => {
  const [filePreview, setFilePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);
  const alert = useAlert();

  const preview = selectedFile
    ? filePreview
    : value
      ? value.startsWith("http")
        ? value
        : `${Config.base_url2}uploads/settings/${value}`
      : "";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert.warning("Invalid image format", {
        description: "Please upload JPG, PNG, GIF, or WEBP.",
      });
      e.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert.warning("Image too large", {
        description: "Image size must be less than 3MB.",
      });
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setFilePreview(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const res = await onUpload(selectedFile);
    if (res?.success && res.data?.store_logo) {
      onChange("store_logo", res.data.store_logo);
      setSelectedFile(null);
      setFilePreview("");
    } else {
      alert.error("Failed to upload logo", {
        description: res?.message || "Please try again.",
      });
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setFilePreview("");
    onChange("store_logo", "");
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Store Logo
      </label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {preview ? (
            <img src={preview} alt="Store logo" className="w-full h-full object-contain" />
          ) : (
            <FiHome className="w-8 h-8 text-gray-300" />
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
              id="settings-logo-input"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-colors"
            >
              <FiUpload className="w-4 h-4" />
              Choose Image
            </button>
            {selectedFile && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <FiUpload className="w-4 h-4" />
                )}
                Upload
              </button>
            )}
          </div>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700"
            >
              <FiX className="w-3.5 h-3.5" />
              Remove logo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const { loading, reload, save } = useSettingsStore();
  const alert = useAlert();

  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      reload().then((res) => {
        if (res?.success) setForm(res.data || {});
      });
    }
  }, [reload]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveTab = async (tabKey) => {
    const configs = FIELD_CONFIGS[tabKey];
    const payload = {};
    configs.forEach((c) => {
      payload[c.key] = form[c.key] ?? "";
    });

    if (tabKey === "general" && !String(payload.store_name || "").trim()) {
      alert.warning("Store name is required", {
        description: "Please enter the store name in the General tab.",
      });
      return;
    }

    setSaving(true);
    try {
      const loadingId = alert.showAlert({
        type: "info",
        message: "Saving settings...",
        description: "Please wait...",
        duration: 0,
        closable: false,
      });

      const res = await save(payload);
      alert.hideAlert(loadingId);

      if (res?.success) {
        setForm(res.data || form);
        alert.success("Settings saved successfully!", {
          description: "Your changes have been updated.",
        });
      } else {
        alert.error("Failed to save settings", {
          description: res?.message || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert.error("Failed to save settings", {
        description: error.message || "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file) => {
    setLogoUploading(true);
    try {
      const res = await uploadLogo(file);
      return res;
    } finally {
      setLogoUploading(false);
    }
  };

  const activeConfigs = FIELD_CONFIGS[activeTab];

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6 hover:shadow-md transition-shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                  <FiSettings className="w-5 h-5 text-white" />
                </div>
                Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1 ml-14">
                Manage your store preferences and system configuration
              </p>
            </div>
            <button
              onClick={async () => {
                const res = await reload();
                if (res?.success) setForm(res.data || {});
                alert.success("Settings refreshed!", {
                  description: "Data has been updated.",
                  duration: 2000,
                });
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
            >
              <FiSettings className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {loading && Object.keys(form).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
            <p className="text-sm text-gray-500 mt-3">Loading settings...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:sticky lg:top-6">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${
                        isActive
                          ? "bg-gray-900 text-white font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className={isActive ? "text-white" : "text-gray-400"}>
                        {tab.icon}
                      </span>
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-medium text-gray-700">
                      {TABS.find((t) => t.key === activeTab)?.label}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activeTab === "general" &&
                        "Store name, currency, tax and system defaults"}
                      {activeTab === "store" && "Logo, contact and address details"}
                      {activeTab === "receipt" && "How your printed receipts look"}
                      {activeTab === "notifications" &&
                        "Telegram and alert preferences"}
                      {activeTab === "security" &&
                        "Registration, session and security options"}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeConfigs
                      .filter((c) => c.type !== "logo")
                      .map((config) => (
                        <div
                          key={config.key}
                          className={
                            config.type === "switch" ||
                            config.type === "textarea"
                              ? "md:col-span-2"
                              : ""
                          }
                        >
                          <Input
                            config={config}
                            value={form[config.key]}
                            onChange={handleChange}
                          />
                        </div>
                      ))}
                  </div>

                  {activeTab === "store" && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <LogoField
                        value={form.store_logo}
                        onChange={handleChange}
                        onUpload={handleLogoUpload}
                        uploading={logoUploading}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleSaveTab(activeTab)}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-50"
                    >
                      {saving ? (
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <FiSave className="w-4 h-4" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
