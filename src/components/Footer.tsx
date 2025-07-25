import React from "react";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <div className="text-left">
      {/* Main Footer Section */}
      <footer className="bg-[#212529] text-white pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Side: Company Info */}
            <div>
              <h5 className="text-lg font-semibold">securearbitrage.com</h5>
              <hr className="border-t border-[#595C5F] w-1/2 my-2" />
              <img
                alt="logo"
                src="/logo.jpg"
                className="w-[60px] h-[60px] rounded-md mb-5"
              />
              {/* Optional description
              <p className="text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              */}
            </div>

            {/* Middle: Quick Links */}
            <div>
              <h5 className="text-lg font-semibold">QUICK LINKS</h5>
              <hr className="border-t border-[#595C5F] w-1/2 my-2" />
              <ul className="space-y-2">
                <li>
                  <NavLink to="https://securearbitrage.com/" className="text-white hover:underline">
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="https://securearbitrage.com/about-us" className="text-white hover:underline">
                    About Us
                  </NavLink>
                </li>
                <li>
                  <NavLink to="https://securearbitrage.com/pricing" className="text-white hover:underline">
                    Pricing
                  </NavLink>
                </li>
                <li>
                  <NavLink to="https://securearbitrage.com/how-it-works" className="text-white hover:underline">
                    How It Works
                  </NavLink>
                </li>
                <li>
                  <NavLink to="https://securearbitrage.com/faqs" className="text-white hover:underline">
                    FAQs
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Right Side: Contact Info */}
            <div>
              <h5 className="text-lg font-semibold">CONTACT INFO</h5>
              <hr className="border-t border-[#595C5F] w-1/2 my-2" />
              <p className="text-sm">Email: support@securearbitrage.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <hr className="border-t border-[#595C5F] mt-8" />
        <div className="bg-[#212529] text-center py-4">
          <p className="text-sm mb-0">
            &copy; {new Date().getFullYear()} securearbitrage.com. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
