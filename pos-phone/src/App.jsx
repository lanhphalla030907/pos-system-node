import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./page/auth/LoginPage";
import Register from "./page/auth/Register";
import HomePage from "./page/home/HomePage";
import MainLayout from "./components/layout/MainLayout";
import Category from "./page/Category";
import MainPage from "./components/layout/MainPage";
import User from "./page/User";
import Supplier from "./page/purchase/Supplier";
import ProductPage from "./page/prouduct/ProductPage";
import CustumerPage from "./page/CustumerPage";
import PosPage from "./page/PosPage";
import AllOrderPage from "./page/order/AllOrderPage";
import AllExpense from "./page/expense/AllExpense";
import ExpenseType from "./page/expense/ExpenseType";
import SalesChart from "./page/order/SalesChart";
import TodaySales from "./page/order/TodaySales";
import RoleManagement from "./page/role/RoleManagement";
import PermissionManagement from "./page/role/PermissionManagement";
import AddEmployee from "./page/employee/AddEmployee";
import EmployeePage from "./page/employee/EmployeePage";
import EmployeeDetails from "./page/employee/EmployeeDetails";

const PlaceholderPage = ({ title }) => <div>{title}</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/employees/add" element={<AddEmployee />} />
          <Route path="/employees/edit/:id" element={<AddEmployee />} />
          <Route path="/employees/:id" element={<EmployeeDetails />} />
          <Route path="/user" element={<User />} />
          <Route path="/supplier" element={<Supplier />} />
          <Route path="/category" element={<Category />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/all-order" element={<AllOrderPage />} />
          <Route path="/all-expense" element={<AllExpense />} />
          <Route path="/expense-type" element={<ExpenseType />} />
          <Route path="/sale-chart" element={<SalesChart />} />
          <Route path="/today-sale" element={<TodaySales />} />
          <Route path="/role-management" element={<RoleManagement />} />
          <Route
            path="/permission-management"
            element={<PermissionManagement />}
          />
          <Route path="/customers" element={<CustumerPage />} />
          <Route path="/stock" element={<PlaceholderPage title="Stock" />} />
          <Route path="/brand" element={<PlaceholderPage title="Brand" />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<h1>Route not found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// App.jsx
// import React from "react";
// import hero from "./assets/lokaly-delivery.svg"
// export default function App() {
//   return (
//     <div className="w-full min-h-screen bg-[#f8f8f8] overflow-hidden font-[Kantumruy_Pro]">
//   {/* Navbar */}
//   <header className="w-full flex items-center justify-between px-12 py-5">
//     <div className="flex items-center gap-2">
//       <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl">
//         អ
//       </div>

//       <h1 className="text-2xl font-black text-gray-800">
//         FOODKH
//       </h1>
//     </div>

//     <nav className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
//       <a href="#" className="text-orange-500 border-b-2 border-orange-500 pb-1">
//         ទំព័រដើម
//       </a>

//       <a href="#">សេវាកម្ម</a>
//       <a href="#">អត្ថប្រយោជន៍</a>
//       <a href="#">របៀបកម្មង់</a>
//       <a href="#">ដៃគូ</a>
//     </nav>

//     <button className="bg-orange-500 hover:bg-orange-600 transition-all text-white px-5 py-2.5 rounded-xl font-semibold shadow-md">
//       ទំនាក់ទំនង
//     </button>
//   </header>

//   {/* Hero */}
//   <section className="relative flex flex-col items-center justify-center text-center pt-10 pb-8">

//     {/* Text */}
//     <div className="z-10">
//       <h1 className="text-4xl md:text-6xl font-black text-orange-500 leading-tight">
//         ដឹកជញ្ជូនអាហារ
//         <br />
//         លឿនបំផុតក្នុងក្រុង
//       </h1>

//       <p className="mt-4 text-gray-600 text-base max-w-xl mx-auto leading-relaxed">
//         យើងប្តេជ្ញាដឹកជញ្ជូនអាហាររបស់អ្នកក្នុងរយៈពេល
//         ៣០ នាទី។
//       </p>

//       <div className="flex flex-row items-center justify-center gap-3 mt-6">
//         <button className="bg-black text-white px-6 py-3 rounded-xl hover:scale-105 transition-all">
//           Google Play
//         </button>

//         <button className="bg-black text-white px-6 py-3 rounded-xl hover:scale-105 transition-all">
//           App Store
//         </button>
//       </div>
//     </div>

//     {/* Hero Images */}
//     <div className="relative mt-8 w-full flex items-center justify-center">

//       {/* Orange Background */}
//       <div className="absolute bottom-0 w-[700px] h-[260px] bg-orange-500 rounded-t-full"></div>

//       {/* Left Phone */}
//       <div className="relative z-20 rotate-[-15deg] shadow-2xl bg-white rounded-[35px] w-[220px] h-[420px] border-[8px] border-black overflow-hidden">
//         <div className="w-full h-full p-4">
//           <div className="w-16 h-2 bg-gray-300 rounded-full mx-auto mb-4"></div>

//           <h2 className="text-2xl font-bold text-gray-800 leading-snug">
//             អាហារ
//             <br />
//             ឆ្ងាញ់
//           </h2>

//           <input
//             type="text"
//             placeholder="ស្វែងរក..."
//             className="mt-4 w-full border border-gray-200 rounded-xl px-3 py-2 outline-none text-sm"
//           />

//           <div className="grid grid-cols-4 gap-2 mt-6">
//             <div className="bg-orange-100 h-10 rounded-lg"></div>
//             <div className="bg-orange-100 h-10 rounded-lg"></div>
//             <div className="bg-orange-100 h-10 rounded-lg"></div>
//             <div className="bg-orange-100 h-10 rounded-lg"></div>
//           </div>
//         </div>
//       </div>

//       {/* Center Image */}
//       <div className="relative z-30 mx-[-40px]">
//         <img
//           src={hero}
//           alt="delivery"
//           className="w-[420px] object-contain"
//         />
//       </div>

//       {/* Right Phone */}
//       <div className="relative z-20 rotate-[15deg] shadow-2xl bg-white rounded-[35px] w-[220px] h-[420px] border-[8px] border-black overflow-hidden">
//         <div className="w-full h-full p-4">
//           <div className="w-16 h-2 bg-gray-300 rounded-full mx-auto mb-4"></div>

//           <h2 className="text-xl font-bold text-gray-800">
//             តាមដាន
//           </h2>

//           <div className="relative mt-6 w-full h-[250px] bg-gray-100 rounded-3xl overflow-hidden">
//             <div className="absolute top-8 left-8 w-4 h-4 rounded-full bg-black"></div>

//             <svg
//               className="absolute inset-0 w-full h-full"
//               viewBox="0 0 300 300"
//             >
//               <path
//                 d="M50 40 C150 50, 100 200, 220 220"
//                 stroke="#f97316"
//                 strokeWidth="6"
//                 fill="none"
//                 strokeLinecap="round"
//               />
//             </svg>

//             <div className="absolute bottom-8 right-8 w-4 h-4 rounded-full bg-blue-500"></div>
//           </div>
//         </div>
//       </div>
//     </div>

//     {/* Floating Items */}
//     <div className="absolute top-[220px] left-12 w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center shadow-lg text-3xl">
//       <img src={hero} alt=""/>
//     </div>

//     <div className="absolute bottom-10 left-4 w-28 h-28 bg-lime-100 rounded-full flex items-center justify-center shadow-xl text-4xl">
//       🍜
//     </div>

//     <div className="absolute top-[200px] right-10 w-24 h-24 bg-yellow-100 rounded-[30px] flex items-center justify-center shadow-xl text-4xl">
//       🍔
//     </div>
//   </section>
// </div>
//   );
// }
