// constants/menu.js (complete version with bottom menu)
import React from "react";
import {
  FiHome,
  FiShoppingCart,
  FiUsers,
  FiUserCheck,
  FiShield,
  FiUser,
  FiBriefcase,
  FiTruck,
  FiBarChart2,
  FiPackage,
  FiGrid,
  FiTag,
  FiDollarSign,
  FiTrendingUp,
  FiList,
  FiClipboard,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiLayers,
  FiBox,
  FiLock,
} from "react-icons/fi";

const getItem = (label, key, icon, children) => ({
  key,
  icon,
  children,
  label,
});

export const menuItems = [
  // Dashboard
  getItem("Dashboard", "/", <FiHome className="w-5 h-5" />),

  // POS Management
  getItem("POS Management", "pos", <FiShoppingCart className="w-5 h-5" />, [
    getItem("POS Sale", "/pos", <FiShoppingCart className="w-4 h-4" />),
    getItem("Today Sale", "/today-sale", <FiTrendingUp className="w-4 h-4" />),
  ]),
  // Role & Permission
  getItem("Role Management", "role", <FiShield className="w-5 h-5" />, [
    getItem("Role", "/role-management", <FiUsers className="w-4 h-4" />),
    getItem(
      "Permission",
      "/permission-management",
      <FiLock className="w-4 h-4" />,
    ),
    getItem("Users", "/user", <FiUserCheck className="w-4 h-4" />),
  ]),

  // Customers
  getItem("Customers", "/customers", <FiUsers className="w-5 h-5" />),
  // Sale Management
  getItem("Sale Management", "sale", <FiBarChart2 className="w-5 h-5" />, [
    getItem(
      "Sale Overview",
      "/sale-chart",
      <FiTrendingUp className="w-4 h-4" />,
    ),
    getItem("All Orders", "/all-order", <FiList className="w-4 h-4" />),
  ]),

  // Product Management
  getItem("Product Management", "products", <FiPackage className="w-5 h-5" />, [
    getItem("Stock Dashboard", "/stock", <FiGrid className="w-4 h-4" />),
    getItem("Categories", "/category", <FiGrid className="w-4 h-4" />),
    getItem("Products", "/product", <FiBox className="w-4 h-4" />),
    getItem("Stock History", "/stock/history", <FiTag className="w-4 h-4" />),
  ]),
  getItem(
    "Purchase Management",
    "purchase",
    <FiPackage className="w-5 h-5" />,
    [
      getItem("Suppliers", "/supplier", <FiTruck className="w-5 h-5" />),
      getItem("All Purchase", "/purchases", <FiBox className="w-4 h-4" />),
      getItem("Add Purchase", "/purchases/add", <FiTag className="w-4 h-4" />),
      getItem("Report", "/purchases/report", <FiTag className="w-4 h-4" />),
    ],
  ),
  //employee management
  getItem(
    "Employee Management",
    "employee",
    <FiPackage className="w-5 h-5" />,
    [
      getItem("Employee", "/employees", <FiGrid className="w-4 h-4" />),
      getItem("Add Employee", "/employees/add", <FiGrid className="w-4 h-4" />),
    ],
  ),

  // Expense Management
  getItem(
    "Expense Management",
    "expense",
    <FiDollarSign className="w-5 h-5" />,
    [
      getItem(
        "All Expenses",
        "/all-expense",
        <FiClipboard className="w-4 h-4" />,
      ),
      getItem(
        "Expense Type",
        "/expense-type",
        <FiLayers className="w-4 h-4" />,
      ),
    ],
  ),
];

// Bottom menu items (Settings, Help, Logout)
export const bottomMenuItems = [
  getItem("Settings", "/settings", <FiSettings className="w-5 h-5" />),
  getItem("Help", "/help", <FiHelpCircle className="w-5 h-5" />),
  getItem("Logout", "/logout", <FiLogOut className="w-5 h-5" />),
];
