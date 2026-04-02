import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-gray-900">
      <Navbar />
      <main className="mx-auto w-full max-w-[1920px] px-24">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;