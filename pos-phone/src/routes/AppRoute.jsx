import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../page/auth/LoginPage";
import Register from "../page/auth/Register";
import MainLayout from "../components/layout/MainLayout";
import DashboardPage from "../page/DashboardPage";
import EmployeePage from "../page/employee/EmployeePage";
import AddEmployee from "../page/employee/AddEmployee";
import EmployeeDetails from "../page/employee/EmployeeDetails";
import PurchasePage from "../page/purchase/PurchasePage";
import AddPurchasePage from "../page/purchase/AddPurchasePage";
import PurchaseDetailPage from "../page/purchase/PurchaseDetailPage";
import PurchaseReportPage from "../page/purchase/PurchaseReportPage";
import StockDashboardPage from "../page/prouduct/StockDashboardPage";
import StockHistoryPage from "../page/prouduct/StockHistoryPage";
import User from "../page/User";
import Supplier from "../page/purchase/Supplier";
import Category from "../page/prouduct/Category";
import ProductPage from "../page/prouduct/ProductPage";
import AllExpense from "../page/expense/AllExpense";
import ExpenseType from "../page/expense/ExpenseType";
import SalesChart from "../page/order/SalesChart";
import AllOrderPage from "../page/order/AllOrderPage";

import TodaySales from "../page/order/TodaySales";
import RoleManagement from "../page/role/RoleManagement";
import PermissionManagement from "../page/role/PermissionManagement";
import LayoutPos from "../components/layout/LayoutPos";
import PosPage from "../page/PosPage";
import CustomerPage from "../page/CustumerPage";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
function AppRoute() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          {/* Employee */}
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/employees/add" element={<AddEmployee />} />
          <Route path="/employees/:id" element={<EmployeeDetails />} />
          <Route path="/employees/edit/:id" element={<AddEmployee />} />
          {/* Purchase */}
          <Route path="/purchases" element={<PurchasePage />} />
          <Route path="/purchases/add" element={<AddPurchasePage />} />
          <Route path="/purchases/:id" element={<PurchaseDetailPage />} />
          <Route path="/purchases/edit/:id" element={<AddPurchasePage />} />
          <Route path="/purchases/report" element={<PurchaseReportPage />} />
          {/* Stock */}
          <Route path="/stock" element={<StockDashboardPage />} />
          <Route path="/stock/history" element={<StockHistoryPage />} />
          {/* User */}
          <Route path="/user" element={<User />} />
          {/* Supplier */}
          <Route path="/supplier" element={<Supplier />} />
          {/* Category */}
          <Route path="/category" element={<Category />} />
          {/* Product */}
          <Route path="/product" element={<ProductPage />} />
         
          {/* Orders */}
          <Route path="/all-order" element={<AllOrderPage />} />
          {/* Expense */}
          <Route path="/all-expense" element={<AllExpense />} />
          <Route path="/expense-type" element={<ExpenseType/>} />
          {/* Sales */}
          <Route path="/sale-chart" element={<SalesChart />} />
          <Route path="/today-sale" element={<TodaySales />} />
          {/* Role & Permission */}
          <Route path="/role-management" element={<RoleManagement />} />
          <Route
            path="/permission-management"
            element={<PermissionManagement />}
          />
          {/* Customer */}
          <Route path="/customers" element={<CustomerPage />} />
          {/* Brnd */}
            <Route path="/brand" element={<PlaceholderPage title="Brand" />} />
          </Route>
          <Route element={<LayoutPos/>}>
            <Route path="/pos" element={<PosPage />} />
          </Route>
        </Route>
        <Route path="*" element={<h1>Route not found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
function PlaceholderPage({ title }) {
  return <h1>{title}</h1>;
}
export default AppRoute;
