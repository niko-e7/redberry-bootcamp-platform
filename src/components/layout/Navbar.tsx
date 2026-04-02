import { Link } from "react-router-dom";
import { PiSparkleFill } from "react-icons/pi";
import { FaRocket } from "react-icons/fa";

function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-[84px] w-full max-w-[1920px] items-center justify-between px-24">
        <Link
          to="/"
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white"
        >
          <FaRocket className="text-xl" />
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/courses"
            className="flex items-center gap-2 text-sm font-medium text-indigo-600"
          >
            <PiSparkleFill className="text-base" />
            Browse Courses
          </Link>

          <button
            type="button"
            className="rounded-lg border border-indigo-500 px-5 py-3 text-sm font-semibold text-indigo-600"
          >
            Log In
          </button>

          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Sign Up
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;