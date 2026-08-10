import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";

const LayoutPos = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
     
        <main>
          <div>
            <Outlet />
          </div>
        </main>
        
      
      </div>
    </div>
  );
};

export default LayoutPos;