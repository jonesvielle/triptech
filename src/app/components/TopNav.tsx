"use client";
import Image from "next/image";
import React, { useState } from "react";
import { IoChevronDown, IoMenu, IoClose } from "react-icons/io5";

interface TopNavProps {}

const TopNav = ({}: TopNavProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [solutionIsClicked, setSolutionIsClicked] = useState<boolean>();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div
      onMouseLeave={() => setSolutionIsClicked(false)}
      className={`absolute w-full py-4 px-5 md:px-10 ${
        solutionIsClicked
          ? "bg-white text-black transition-all duration-300 ease-in-out"
          : "bg-transparent"
      }`}
    >
      <div
        onClick={() => {
          setSolutionIsClicked(false);
        }}
        className="flex justify-between items-center"
      >
        {/* Logo */}
        <Image
          style={{ zIndex: 2 }}
          height={50} // Adjusted for mobile
          width={150} // Adjusted for mobile
          alt="Logo"
          src={
            solutionIsClicked
              ? "/images/logo/black-logo-text.png"
              : "/images/logo/white-logo-text.png"
          }
          priority
        />

        {/* Hamburger Menu (Mobile) */}
        <button
          className={`block md:hidden ${
            solutionIsClicked ? "text-primary-dark" : "text-white"
          } z-50`}
          onClick={() => {
            toggleMenu();
            if (solutionIsClicked) {
              setSolutionIsClicked(false);
            } else {
              setSolutionIsClicked(true);
            }
          }}
        >
          {isMenuOpen ? <IoClose size={30} /> : <IoMenu size={30} />}
        </button>

        {/* Desktop Menu */}
        <div
          className={`hidden md:flex flex-row space-x-6 ${
            solutionIsClicked ? "text-primary-dark" : "text-white"
          } z-10 `}
        >
          <div className="px-2 cursor-pointer hover:font-bold">Products</div>
          <div
            onMouseEnter={() => setSolutionIsClicked(true)}
            className="px-2 cursor-pointer hover:font-bold flex items-center"
          >
            Solutions
            <IoChevronDown style={{ marginLeft: 3 }} />
          </div>
          <div className="px-2 cursor-pointer hover:font-bold">About Us</div>
          <div className="px-2 cursor-pointer hover:font-bold">News</div>
          <div className="px-2 cursor-pointer hover:font-bold">Contact Us</div>
        </div>

        {/* Call to Action Buttons */}
        <div className="hidden md:flex flex-row z-10 space-x-4">
          <div className="border border-white px-4 py-1 rounded-xl">Login</div>
          <div className="px-4 py-1 border bg-custom-blue text-white rounded-xl">
            Get a Quote
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:hidden bg-white text-black absolute top-32 left-0 w-full z-40 shadow-lg`}
      >
        <div className="flex flex-col space-y-4 p-5">
          <div
            className="cursor-pointer hover:font-bold"
            onClick={() => setSolutionIsClicked(false)}
          >
            Products
          </div>
          <div
            className="cursor-pointer hover:font-bold flex items-center"
            onClick={() => setSolutionIsClicked(!solutionIsClicked)}
          >
            Solutions
            <IoChevronDown style={{ marginLeft: 3 }} />
          </div>
          {solutionIsClicked && (
            <div className="ml-4 space-y-2">
              <div className="cursor-pointer hover:font-bold">
                Solar Systems
              </div>
              <div className="cursor-pointer hover:font-bold">
                Residential Solar
              </div>
              <div className="cursor-pointer hover:font-bold">
                Commercial Solar
              </div>
              <div className="cursor-pointer hover:font-bold">
                Battery Storage
              </div>
            </div>
          )}
          <div
            className="cursor-pointer hover:font-bold"
            onClick={() => setSolutionIsClicked(false)}
          >
            About Us
          </div>
          <div
            className="cursor-pointer hover:font-bold"
            onClick={() => setSolutionIsClicked(false)}
          >
            News
          </div>
          <div
            className="cursor-pointer hover:font-bold"
            onClick={() => setSolutionIsClicked(false)}
          >
            Contact Us
          </div>
          <div className="border-t border-gray-300 mt-4 pt-4 justify-between">
            <button
              onClick={() => setSolutionIsClicked(false)}
              className="px-4 py-2 border bg-custom-blue text-white rounded-xl text-center"
            >
              Get a Quote
            </button>
            <button
              onClick={() => setSolutionIsClicked(false)}
              className="border border-gray-400 px-4 py-2 rounded-xl text-center mb-2 ml-5"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Solutions dropdown for desktop */}
      {solutionIsClicked && !isMenuOpen && (
        <>
          <div className="border-[1px] border-primary-gray mt-6" />

          <div className="hidden md:flex flex-row justify-between mt-6 space-y-4 md:space-y-0">
            <div className="md:w-1/5">
              <div className="font-bold cursor-pointer">Solar Systems</div>
              <div className="mt-3 text-sm">
                Powering the next generation of sustainable energy management
                and supply systems.
              </div>
            </div>

            <div className="md:w-1/5">
              <div className="font-bold cursor-pointer">Residential Solar</div>
              <div className="mt-3 text-sm">
                Powering the next generation of sustainable energy management
                and supply systems.
              </div>
            </div>

            <div className="md:w-1/5">
              <div className="font-bold cursor-pointer">Commercial Solar</div>
              <div className="mt-3 text-sm">
                Powering the next generation of sustainable energy management
                and supply systems.
              </div>
            </div>

            <div className="md:w-1/5">
              <div className="font-bold cursor-pointer">Battery Storage</div>
              <div className="mt-3 text-sm">
                Powering the next generation of sustainable energy management
                and supply systems.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TopNav;
