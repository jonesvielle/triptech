"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoChevronDown, IoMenu, IoClose } from "react-icons/io5";
import { ABOUT_PAGE, CONTACT_PAGE } from "../helpers/routes";

// interface TopNavProps {
//   currentPath: string;
// }

const TopNav = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [solutionIsClicked, setSolutionIsClicked] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleRouteToHome = () => {
    router.push("/");
  };

  return (
    <div
      onMouseLeave={() => {
        setIsHovered(false);
        setSolutionIsClicked(false);
      }}
      className={`absolute w-full py-4 px-5 md:px-10 z-10 ${
        solutionIsClicked || isHovered
          ? "bg-white text-black transition-all duration-300 ease-in-out"
          : "bg-transparent"
      }`}
    >
      <div
        onClick={() => setSolutionIsClicked(false)}
        className="flex justify-between items-center"
      >
        {/* Logo */}
        <Image
          onClick={handleRouteToHome}
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
            setSolutionIsClicked(false); // Close Solutions dropdown on mobile menu toggle
          }}
        >
          {isMenuOpen ? <IoClose size={30} /> : <IoMenu size={30} />}
        </button>

        {/* Desktop Menu */}
        <div
          className={`hidden md:flex flex-row space-x-3 ${
            solutionIsClicked || isHovered ? "text-primary-dark" : "text-white"
          } z-50 `}
        >
          <div className="px-2 cursor-pointer hover:font-bold">Products</div>
          <div
            onMouseEnter={() => {
              setIsHovered(true);
              setSolutionIsClicked(true);
            }}
            onMouseLeave={() => setIsHovered(false)}
            className="px-2 cursor-pointer hover:font-bold flex items-center bg-red-5"
          >
            Solutions
            <IoChevronDown style={{ marginLeft: 3 }} />
          </div>
          <div
            className={`px-2 cursor-pointer hover:font-bold ${
              currentPath === "/about" && "font-bold"
            }`}
          >
            <Link href={ABOUT_PAGE}> About Us</Link>
          </div>
          <div className="px-2 cursor-pointer hover:font-bold">News</div>
          <Link href={CONTACT_PAGE}>
            <div className="px-2 cursor-pointer hover:font-bold">
              Contact Us
            </div>
          </Link>
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
        } md:hidden bg-white text-black absolute top-32 left-0 w-full z-50 shadow-lg`}
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
            className={`cursor-pointer hover:font-bold ${
              currentPath === "/about" && "font-bold"
            }`}
            onClick={() => setSolutionIsClicked(false)}
          >
            <Link href={"/about"}> About Us</Link>
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
            <Link href={"/contact"}>Contact Us</Link>
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
      {(isHovered || solutionIsClicked) && !isMenuOpen && (
        <div className="border-[1px] border-primary-gray mt-6">
          <div className="flex justify-between md:space-x-3 px-4 py-4 md:px-10 md:py-6 bg-gray-50 rounded-lg">
            {/* Solar Systems */}
            <div className="w-auto p-4 cursor-pointer hover:bg-custom-lightblue rounded-lg">
              <div className="font-bold text-lg text-primary-dark">
                Solar Systems
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Powering the next generation of sustainable energy management
                and supply systems.
              </p>
            </div>

            {/* Residential Solar */}
            <div className="w-auto p-4 cursor-pointer hover:bg-custom-lightblue rounded-lg">
              <div className="font-bold text-lg text-primary-dark">
                Residential Solar
              </div>
              <p className="mt-2 text-sm text-gray-600">
                A cleaner, more affordable energy solution for homeowners.
              </p>
            </div>

            {/* Commercial Solar */}
            <div className="w-auto p-4 cursor-pointer hover:bg-custom-lightblue rounded-lg">
              <div className="font-bold text-lg text-primary-dark">
                Commercial Solar
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Scalable solar energy systems designed for businesses.
              </p>
            </div>

            {/* Battery Storage */}
            <div className="w-auto p-4 cursor-pointer hover:bg-custom-lightblue rounded-lg">
              <div className="font-bold text-lg text-primary-dark">
                Battery Storage
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Efficient storage solutions to complement solar energy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNav;
