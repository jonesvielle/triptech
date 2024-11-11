"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoChevronDown, IoMenu, IoClose } from "react-icons/io5";

interface TopNavProps {
  currentPath: string;
}

const TopNav = ({ currentPath }: TopNavProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [solutionIsClicked, setSolutionIsClicked] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) setSolutionIsClicked(false); // Close dropdown when menu closes
  };

  const handleRouteToHome = () => {
    router.push("/");
  };

  return (
    <div
      onMouseLeave={() => !isMenuOpen && setSolutionIsClicked(false)}
      className={`absolute w-full py-4 px-5 md:px-10 z-10 ${
        solutionIsClicked
          ? "bg-white text-black transition-all duration-300 ease-in-out"
          : "bg-transparent"
      }`}
    >
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Image
          onClick={handleRouteToHome}
          style={{ zIndex: 2 }}
          height={50}
          width={150}
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
          onClick={toggleMenu}
        >
          {isMenuOpen ? <IoClose size={30} /> : <IoMenu size={30} />}
        </button>

        {/* Desktop Menu */}
        <div
          className={`hidden md:flex flex-row space-x-6 ${
            solutionIsClicked ? "text-primary-dark" : "text-white"
          } z-50 `}
        >
          <div className="px-2 cursor-pointer hover:font-bold">Products</div>
          <div
            onMouseEnter={() => setSolutionIsClicked(true)}
            onClick={(e) => {
              e.stopPropagation();
              setSolutionIsClicked((prev) => !prev);
            }}
            className="px-2 cursor-pointer hover:font-bold flex items-center"
          >
            Solutions
            <IoChevronDown style={{ marginLeft: 3 }} />
          </div>
          <div
            className={`px-2 cursor-pointer hover:font-bold ${
              currentPath === "/about" && "font-bold"
            }`}
          >
            <Link href={"/about"}> About Us</Link>
          </div>
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
        } md:hidden bg-white text-black fixed top-32 left-0 w-full z-50 shadow-lg`}
      >
        <div className="flex flex-col space-y-4 p-5">
          <div className="cursor-pointer hover:font-bold">Products</div>
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
            className={`cursor-pointer hover:font-bold ${
              currentPath === "/about" && "font-bold"
            }`}
          >
            <Link href={"/about"}> About Us</Link>
          </div>
          <div className="cursor-pointer hover:font-bold">News</div>
          <div className="cursor-pointer hover:font-bold">Contact Us</div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
