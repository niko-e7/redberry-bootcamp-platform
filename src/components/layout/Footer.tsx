import { useState } from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaRocket,
} from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileModal from "../modals/ProfileModal";

function Footer() {
  const navigate = useNavigate();
  const { openSidebar, isAuthenticated, openLogin } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      <footer className="border-t border-gray-200 bg-[#f5f5f5]">
        <div className="mx-auto w-full max-w-[1920px] px-24 py-14">
          <div className="flex justify-between gap-12">
            <div className="max-w-[320px]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <FaRocket className="text-sm" />
                </div>
                <h3 className="text-[28px] font-semibold text-indigo-950">
                  Bootcamp
                </h3>
              </div>

              <p className="max-w-[250px] text-sm leading-6 text-indigo-950">
                Your learning journey starts here!
                <br />
                Browse courses to get started.
              </p>

              <div className="mt-5 flex items-center gap-4 text-indigo-500">
                <FaFacebookF className="cursor-pointer text-sm" />
                <FaTwitter className="cursor-pointer text-sm" />
                <FaInstagram className="cursor-pointer text-sm" />
                <FaLinkedinIn className="cursor-pointer text-sm" />
                <FaYoutube className="cursor-pointer text-sm" />
              </div>
            </div>

            <div className="flex gap-24">
              <div>
                <h4 className="mb-4 text-lg font-semibold text-indigo-950">
                  Explore
                </h4>
                <ul className="space-y-2 text-base text-gray-500">
                  <li
                    className="cursor-pointer hover:text-indigo-600"
                    onClick={() =>
                      isAuthenticated ? openSidebar() : openLogin()
                    }
                  >
                    Enrolled Courses
                  </li>
                  <li
                    className="cursor-pointer hover:text-indigo-600"
                    onClick={() => navigate("/courses")}
                  >
                    Browse Courses
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-lg font-semibold text-indigo-950">
                  Account
                </h4>
                <ul className="space-y-2 text-base text-gray-500">
                  <li
                    className="cursor-pointer hover:text-indigo-600"
                    onClick={() =>
                      isAuthenticated ? setShowProfile(true) : openLogin()
                    }
                  >
                    My Profile
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-lg font-semibold text-indigo-950">
                  Contact
                </h4>
                <ul className="space-y-3 text-base text-gray-500">
                  <li className="flex items-center gap-2">
                    <FiMail className="text-indigo-950" />
                    contact@company.com
                  </li>
                  <li className="flex items-center gap-2">
                    <FiPhone className="text-indigo-950" />
                    (+995) 555 111 222
                  </li>
                  <li className="flex items-center gap-2">
                    <FiMapPin className="text-indigo-950" />
                    Aghmashenebeli St.115
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-14 flex items-center justify-between text-sm text-gray-500">
            <p>Copyright © 2026 Redberry International</p>
            <div className="flex items-center gap-3">
              <span>All Rights Reserved</span>
              <span>|</span>
              <span className="text-indigo-600">Terms and Conditions</span>
              <span>|</span>
              <span className="text-indigo-600">Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
