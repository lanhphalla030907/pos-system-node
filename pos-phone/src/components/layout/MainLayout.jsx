import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

import Navbar from "./Navbar";

const MainLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto lg:p-6 p-4">
          <div>
            <Outlet />
          </div>
        </main>
        
      
      </div>
    </div>
  );
};

export default MainLayout;