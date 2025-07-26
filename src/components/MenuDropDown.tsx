import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { path: "https://securearbitrage.com/about-us", label: "About Us" },
  { path: "https://securearbitrage.com/pricing", label: "Pricing" },
  { path: "https://securearbitrage.com/how-it-works", label: "How It Works" },
  { path: "https://securearbitrage.com/faqs", label: "Faqs" },
  { path: "https://securearbitrage.com/past-opportunities", label: "Past Opportunities" },
  { path: "https://securearbitrage.com/auto-detector", label: "Auto Detector" },
  { path: "https://securearbitrage.com/crosschain-bnb-usdt-crosschain", label: "Cross Chain" },
  { path: "https://signals.securearbitrage.com", label: "Signals" },
  { path: "https://securearbitrage.com/announcements", label: "Announcements" },
];

const MenuDropdown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const toggleDropdown = () => setOpen(!open);

  const closeDropdown = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  const getLinkStyle = (path) => {
    return location.pathname === path
      ? "text-yellow-400 font-semibold"
      : "text-white";
  };

  useEffect(() => {
    document.addEventListener("click", closeDropdown);
    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={toggleDropdown}
        className="text-white px-4 py-2 bg-transparent hover:text-yellow-400 focus:outline-none"
      >
        Menu ▾
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-52 bg-[#212529]  rounded-md shadow-lg">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2 hover:bg-gray-800 ${getLinkStyle(link.path)}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;
