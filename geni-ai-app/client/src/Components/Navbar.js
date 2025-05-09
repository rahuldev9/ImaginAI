import React from "react";
import Switch from "./Switch";

const Navbar = ({ isDarkMode, toggleDarkMode }) => (
  <nav className="sticky top-0 w-full bg-[#212529] text-white px-8 py-4 shadow-md z-50 flex flex-row justify-between ">
    <h1 className="text-xl font-bold ">GenImage</h1>
    <Switch isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
  </nav>
);

export default Navbar;
