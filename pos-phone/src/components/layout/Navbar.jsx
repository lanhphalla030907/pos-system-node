import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../../store/profile.store";
import {
  FiSearch,
  FiPlus,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiGrid,
  FiShoppingBag,
  FiBarChart2,
  FiUsers,
  FiPackage,
} from "react-icons/fi";

const Navbar = () => {
  const profile = getProfile();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const onLogout = () => {
    localStorage.removeItem("profile");
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const getInitials = () => {
    if (!profile?.username) return "U";
    return profile.username
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user display name
  const getDisplayName = () => {
    if (profile?.name) return profile.name;
    if (profile?.username) return profile.username;
    return "User";
  };

  // Get user role
  const getUserRole = () => {
    if (profile?.role_id === 1) return "Administrator";
    if (profile?.role_id === 2) return "Manager";
    if (profile?.role_id === 3) return "Cashier";
    return "User";
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0 shadow-sm">
      {/* Left Section - Search */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition-all">
          <FiSearch className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-48 text-gray-700 placeholder-gray-400"
          />
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-200 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Actions */}
        <button className="hidden sm:flex p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative">
          <FiPlus className="w-5 h-5" />
        </button>

        <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative">
          <FiBell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        <div className="w-px h-8 bg-gray-200 hidden sm:block" />

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
          >
            {/* Avatar with fallback */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-black/10">
              {getInitials()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-tight">
                {getDisplayName()}
              </p>
              <p className="text-xs text-gray-400 leading-tight">
                {getUserRole()}
              </p>
            </div>
            <FiChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{getDisplayName()}</p>
                      <p className="text-xs text-gray-400">{getUserRole()}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => { navigate("/profile"); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiUser className="w-4 h-4 text-gray-400" />
                    My Profile
                  </button>

                  <button
                    onClick={() => { navigate("/settings"); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiSettings className="w-4 h-4 text-gray-400" />
                    Settings
                  </button>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;