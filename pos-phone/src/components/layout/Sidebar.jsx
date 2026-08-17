// components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { menuItems, bottomMenuItems } from "../../constants/menu";
import { useSettingsStore } from "../../store/settings.store";
import { Config } from "../../util/config";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { settings } = useSettingsStore();

  const storeName = settings.store_name || "POS System";
  const storeLogo = settings.store_logo || "";
  const storeLogoUrl = storeLogo.startsWith("http")
    ? storeLogo
    : storeLogo
      ? `${Config.base_url2}uploads/settings/${storeLogo}`
      : "";

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Auto-expand parent menus
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children?.some((child) => pathname === child.key)) {
        if (!openKeys.includes(item.key)) {
          setOpenKeys((prev) => [...prev, item.key]);
        }
      }
    });
  }, [pathname]);

  const toggleSubMenu = (key) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleItemClick = (key) => {
    if (key === "/logout") {
      localStorage.removeItem("profile");
      localStorage.removeItem("access_token");
      navigate("/login");
      return;
    }
    navigate(key);
  };

  const renderMenuItem = (item, depth = 0) => {
    const hasChildren = item.children?.length > 0;
    const isActive =
      pathname === item.key ||
      item.children?.some((child) => pathname === child.key);
    const isOpen = openKeys.includes(item.key);

    if (hasChildren) {
      return (
        <div key={item.key} className="mb-1">
          <button
            onClick={() => !collapsed && toggleSubMenu(item.key)}
            className={`
              w-full flex items-center px-3.5 py-2.5 rounded-lg transition-all duration-200
              ${isActive ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
              ${collapsed ? "justify-center" : "justify-between"}
              group relative
            `}
            title={collapsed ? item.label : ""}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`text-lg flex-shrink-0 ${isActive ? "text-gray-800" : "text-gray-400 group-hover:text-gray-600"}`}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate text-sm">{item.label}</span>
              )}
            </div>
            {!collapsed && (
              <svg
                className={`
                  w-4 h-4 transition-transform duration-200 flex-shrink-0
                  ${isOpen ? "rotate-180" : ""}
                  text-gray-400
                `}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </button>

          {!collapsed && isOpen && (
            <div className="ml-6 mt-1 space-y-0.5 border-l border-gray-200 pl-3">
              {item.children.map((child) => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.key}
        onClick={() => handleItemClick(item.key)}
        className={`
          w-full flex items-center px-3.5 py-2.5 rounded-lg transition-all duration-200
          ${isActive ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
          ${collapsed ? "justify-center" : "justify-start"}
          group relative
        `}
        title={collapsed ? item.label : ""}
      >
        <span
          className={`text-lg flex-shrink-0 ${isActive ? "text-gray-800" : "text-gray-400 group-hover:text-gray-600"}`}
        >
          {item.icon}
        </span>
        {!collapsed && (
          <span className="ml-3 truncate text-sm">{item.label}</span>
        )}
        {isActive && !collapsed && (
          <span className="absolute right-2 w-1 h-6 rounded-full bg-gray-800" />
        )}
        {isActive && collapsed && (
          <span className="absolute -right-1 w-1 h-8 rounded-full bg-gray-800" />
        )}
      </button>
    );
  };

  // Mobile overlay
  const MobileOverlay = () => (
    <div
      className={`
        fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden
        ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
      onClick={() => setMobileOpen(false)}
    />
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg lg:hidden hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {mobileOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      <MobileOverlay />

      {/* Sidebar */}
      <aside
        className={`
          bg-white border-r border-gray-200 h-screen transition-all duration-300 ease-in-out
          flex flex-col flex-shrink-0 fixed lg:relative z-50
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 flex-shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              {storeLogoUrl ? (
                <img
                  src={storeLogoUrl}
                  alt={storeName}
                  className="w-9 h-9 rounded-lg object-contain flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              )}
              <div>
                <h1 className="text-base font-bold text-gray-900 tracking-tight truncate max-w-[160px]">
                  {storeName}
                </h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  Management
                </p>
              </div>
            </div>
          ) : (
            storeLogoUrl ? (
              <img
                src={storeLogoUrl}
                alt={storeName}
                className="w-9 h-9 rounded-lg object-contain mx-auto flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center mx-auto flex-shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            )
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            {collapsed ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7M19 19l-7-7 7-7"
                />
              </svg>
            )}
          </button>
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="space-y-0.5">
            {menuItems.map((item) => renderMenuItem(item))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-0.5">
            {bottomMenuItems.map((item) => renderMenuItem(item))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-3 flex-shrink-0">
          <button
            onClick={() => navigate("/profile")}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200
              ${collapsed ? "justify-center" : "justify-start"}
              group
            `}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium text-sm flex-shrink-0">
              JD
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-800 truncate">
                  John Doe
                </p>
                <p className="text-xs text-gray-400 truncate">Administrator</p>
              </div>
            )}
            {!collapsed && (
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
