import { useState } from "react";
import { Outlet } from "react-router-dom";
import BusinessSidebar from "../components/business/BusinessSidebar";
import Header from "../components/Header";

const BusinessLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <BusinessSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface"
        >
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default BusinessLayout;

