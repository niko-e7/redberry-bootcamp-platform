import { useState } from "react";
import { Link } from "react-router-dom";
import { PiSparkleFill } from "react-icons/pi";
import { FaRocket } from "react-icons/fa";
import { FiBookOpen, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import ProfileModal from "../modals/ProfileModal";

function Navbar() {
  const {
    isAuthenticated,
    user,
    openLogin,
    openRegister,
    logout,
    openSidebar,
  } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      <header className="border-b border-gray-200 bg-[#f5f5f5]">
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
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-200"
            >
              <PiSparkleFill className="text-base" />
              Browse Courses
            </Link>

            {isAuthenticated ? (
              <>
                <button
                  onClick={openSidebar}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <FiBookOpen />
                  Enrolled Courses
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown((p) => !p)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {user?.avatar ? (
                      <img
                        src={`${user.avatar}?t=${Date.now()}`}
                        alt={user.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className="text-gray-600" />
                    )}
                  </button>
                  {!user?.profileComplete && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-yellow-400 border-2 border-white" />
                  )}

                  {showProfileDropdown && (
                    <div className="absolute right-0 top-full mt-2 z-20 w-44 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setShowProfile(true);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          logout();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={openLogin}
                  className="rounded-lg border border-indigo-500 px-5 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={openRegister}
                  className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}

export default Navbar;
