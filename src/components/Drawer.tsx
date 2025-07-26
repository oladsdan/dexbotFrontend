// components/Drawer.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("secure_token");

  const isActive = (path: string) =>
    location.pathname === path ? "text-yellow-400 font-bold" : "text-white";

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 left-0 overflow-y-auto  w-72 h-full bg-[#121212] shadow-lg p-6 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button className="text-white text-xl mb-4" onClick={onClose}>
            ✕
          </button>
        </div>

        <ul className="space-y-1 text-left mt-8">
          {[
            { label: "Home", path: "https://securearbitrage.com/" },
            { label: "About Us", path: "https://securearbitrage.com/about-us" },
            { label: "Pricing", path: "https://securearbitrage.com/pricing" },
            {
              label: "How It Works",
              path: "https://securearbitrage.com/how-it-works",
            },
            { label: "Faqs", path: "https://securearbitrage.com/faqs" },
            {
              label: "Past Opportunities",
              path: "https://securearbitrage.com/past-opportunities",
            },
            {
              label: "Auto Detector",
              path: "https://securearbitrage.com/auto-detector",
            },
            {
              label: "Cross chain",
              path: "https://securearbitrage.com/crosschain-bnb-usdt-crosschain",
            },
            {
              label: "Announcements",
              path: "https://securearbitrage.com/announcements",
            },
          ].map((item, index, arr) => (
            <li key={item.path}>
              <a
                href={item.path}
                className={`block cursor-pointer py-2 ${isActive(item.path)}`}
                onClick={onClose}
              >
                {item.label}
              </a>
              {index !== arr.length - 1 && <hr className="border-gray-700" />}
            </li>
          ))}
          <li className="mt-4">
            <a
              href="https://securearbitrage.com/sign-in"
              className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white  block px-4 py-2 rounded-md shadow cursor-pointer"
              onClick={onClose}
            >
              Sign In
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Drawer;
