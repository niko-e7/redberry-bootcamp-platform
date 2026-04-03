import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default AppLayout;