import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-[#f5f5f5] pb-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
