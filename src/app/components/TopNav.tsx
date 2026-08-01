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

const SHOP_URL = "https://shop.tri-p.tech";

const TopNav = () => {
  const router = useRouter();
  const currentPath = usePathname() || "";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [solutionIsClicked, setSolutionIsClicked] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  if (currentPath === "/services/solar/admin" || currentPath === "/services/solar/admin-native") return null;

  const usesSolidNav =
    currentPath === "/services/solar/calculator" ||
    currentPath === "/services/solar/calculator-native" ||
    currentPath === "/services/solar/admin" ||
    currentPath === "/news";
  const showQuoteCta =
    currentPath !== "/services/solar/calculator" &&
    currentPath !== "/services/solar/calculator-native";
  const useDarkNavText = usesSolidNav || solutionIsClicked || isHovered;

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
      className={`absolute w-full py-4 px-5 md:px-10 z-[1000] ${
        currentPath === "/services/solar/calculator" ? "max-lg:hidden" : ""
      } ${
        useDarkNavText
          ? "bg-white text-black transition-all duration-300 ease-in-out"
          : "bg-transparent"
      }`}
    >
      <div
        onClick={() => setSolutionIsClicked(false)}
        className="relative flex justify-between items-center"
      >
        {/* Logo */}
        <Image
          onClick={handleRouteToHome}
          className="relative z-[2] h-auto w-[150px] cursor-pointer object-contain"
          height={68}
          width={150}
          alt="TRI-P Tech Limited logo"
          src={useDarkNavText ? "/images/logo/Flogo C MOD B.png" : "/images/logo/FLogo W MOD.png"}
          priority
        />

        {/* Hamburger Menu (Mobile) */}
        <button
          className={`block md:hidden ${
            useDarkNavText ? "text-primary-dark" : "text-white"
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
          className={`topnav-desktop-menu flex-row space-x-3 ${
            useDarkNavText ? "text-primary-dark" : "text-white"
          } z-50 `}
        >
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 cursor-pointer hover:font-bold"
          >
            Products
          </a>
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
          <Link href="/news">
            <div
              className={`px-2 cursor-pointer hover:font-bold ${
                currentPath === "/news" && "font-bold"
              }`}
            >
              News
            </div>
          </Link>
          <Link href={CONTACT_PAGE}>
            <div className="px-2 cursor-pointer hover:font-bold">
              Contact Us
            </div>
          </Link>
          <Link href="/services/solar/calculator">
            <div
              className={`px-2 cursor-pointer hover:font-bold ${
                currentPath === "/services/solar/calculator" && "font-bold"
              }`}
            >
              Solar Calculator
            </div>
          </Link>
        </div>

        {/* Call to Action Buttons */}
        {showQuoteCta ? (
          <div className="hidden md:flex flex-row justify-end z-10 space-x-4">
            <Link href="/services/solar/calculator">
              <div className="px-4 py-1 border bg-custom-blue text-white rounded-xl">
                Get a quote
              </div>
            </Link>
          </div>
        ) : null}
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:hidden bg-white text-black absolute top-32 left-0 w-full z-50 shadow-lg`}
      >
        <div className="flex flex-col space-y-4 p-5">
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer hover:font-bold"
            onClick={() => setSolutionIsClicked(false)}
          >
            Products
          </a>
          <div
            className="cursor-pointer hover:font-bold flex items-center"
            onClick={() => setSolutionIsClicked(!solutionIsClicked)}
          >
            Solutions
            <IoChevronDown style={{ marginLeft: 3 }} />
          </div>
          {solutionIsClicked && (
            <div className="ml-4 space-y-2">
              <Link href="/services/solar" className="block cursor-pointer hover:font-bold">
                Solar Systems
              </Link>
              <Link href="/services/solar" className="block cursor-pointer hover:font-bold">
                Residential Solar
              </Link>
              <Link href="/services/solar" className="block cursor-pointer hover:font-bold">
                Commercial Solar
              </Link>
              <Link href="/services/solar" className="block cursor-pointer hover:font-bold">
                Battery Storage
              </Link>
              <Link href="/services/3d-printing" className="block cursor-pointer hover:font-bold">
                3D Printing
              </Link>
              <Link href="/services/cctv-installation" className="block cursor-pointer hover:font-bold">
                CCTV Installation
              </Link>
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
          <Link
            href="/news"
            className="cursor-pointer hover:font-bold"
            onClick={() => setSolutionIsClicked(false)}
          >
            News
          </Link>
          <div
            className="cursor-pointer hover:font-bold"
            onClick={() => setSolutionIsClicked(false)}
          >
            <Link href={"/contact"}>Contact Us</Link>
          </div>
          <div
            className="cursor-pointer hover:font-bold"
            onClick={() => setSolutionIsClicked(false)}
          >
            <Link href={"/services/solar/calculator"}>Solar Calculator</Link>
          </div>
          {showQuoteCta ? (
            <div className="border-t border-gray-300 mt-4 pt-4 justify-between">
              <Link href="/services/solar/calculator">
                <button
                  onClick={() => setSolutionIsClicked(false)}
                  className="px-4 py-2 border bg-custom-blue text-white rounded-xl text-center"
                >
                  Get a quote
                </button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Solutions dropdown for desktop */}
      {(isHovered || solutionIsClicked) && !isMenuOpen && (
        <div className="relative z-[1000] mt-6 border-[1px] border-primary-gray bg-white shadow-lg">
          <div className="grid gap-3 px-4 py-4 md:grid-cols-3 lg:grid-cols-6 md:px-10 md:py-6 bg-gray-50 rounded-lg">
            {/* Solar Systems */}
            <Link href="/services/solar" className="w-auto p-4 cursor-pointer hover:bg-custom-lightblue rounded-lg">
              <div className="font-bold text-lg text-primary-dark">
                Solar Systems
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Powering the next generation of sustainable energy management
                and supply systems.
              </p>
            </Link>

            {/* Residential Solar */}
            <Link href="/services/solar" className="w-auto p-4 cursor-pointer hover:bg-custom-lightblue rounded-lg">
              <div className="font-bold text-lg text-primary-dark">
                Residential Solar
              </div>
              <p className="mt-2 text-sm text-gray-600">
                A cleaner, more affordable energy solution for homeowners.
              </p>
            </Link>

            {/* Commercial Solar */}
            <Link href="/services/solar" className="w-auto p-4 cursor-pointer hover:bg-custom-lightblue rounded-lg">
              <div className="font-bold text-lg text-primary-dark">
                Commercial Solar
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Scalable solar energy systems designed for businesses.
              </p>
            </Link>

            {/* Battery Storage */}
            <Link href="/services/solar" className="w-auto p-4 cursor-pointer hover:bg-custom-lightblue rounded-lg">
              <div className="font-bold text-lg text-primary-dark">
                Battery Storage
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Efficient storage solutions to complement solar energy.
              </p>
            </Link>

            {/* 3D Printing */}
            <Link href="/services/3d-printing" className="w-auto p-4 cursor-pointer hover:bg-custom-lightblue rounded-lg">
              <div className="font-bold text-lg text-primary-dark">
                3D Printing
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Custom printing, prototypes, models, and practical replacement parts.
              </p>
            </Link>

            {/* CCTV Installation */}
            <Link href="/services/cctv-installation" className="w-auto p-4 cursor-pointer hover:bg-custom-lightblue rounded-lg">
              <div className="font-bold text-lg text-primary-dark">
                CCTV Installation
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Camera placement, recorder setup, mobile viewing, and monitoring.
              </p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNav;
