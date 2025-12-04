import { Header } from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { NavigationProvider } from "@/context/NavigationContext";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <NavigationProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar />
        <main className="pt-16 pl-64">
          <div className="p-6 mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </NavigationProvider>
  );
};

export default DashboardLayout;
