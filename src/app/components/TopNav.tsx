"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoCalculatorOutline, IoChevronDown, IoClose, IoHomeOutline, IoMenu, IoNewspaperOutline, IoPersonOutline, IoStorefrontOutline, IoSunnyOutline } from "react-icons/io5";
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
  const usesSolidNav =
    currentPath === "/services/solar/calculator" ||
    currentPath === "/services/solar/calculator-native" ||
    currentPath === "/services/solar/admin" ||
    currentPath === "/news";
  const useDarkNavText = usesSolidNav || solutionIsClicked || isHovered;
  const mobileMenuUsesDarkPanel = currentPath.startsWith("/services/solar/calculator");

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setSolutionIsClicked(false);
  };

  useEffect(() => {
    closeMobileMenu();
  }, [currentPath]);

  useEffect(() => {
    if (!isMenuOpen || typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleRouteToHome = () => {
    router.push("/");
  };

  if (currentPath === "/services/solar/admin" || currentPath === "/services/solar/admin-native") return null;

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
      </div>

      {/* Mobile Menu */}
      {isMenuOpen ? (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close mobile navigation"
            className="fixed inset-0 z-40 cursor-default bg-black/35 backdrop-blur-[2px] transition-opacity"
            onClick={closeMobileMenu}
          />
          <nav
            className={`fixed left-5 right-5 top-[92px] z-50 overflow-hidden rounded-[24px] border shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition ${
              mobileMenuUsesDarkPanel
                ? "border-[#16e08f]/35 bg-[#031822]/95 text-white"
                : "border-primary-gray bg-white text-primary-dark"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b px-4 py-3 ${
                mobileMenuUsesDarkPanel
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-primary-gray bg-[#f4fbf8]"
              }`}
            >
              <span
                className={`text-[10px] font-extrabold uppercase tracking-[0.28em] ${
                  mobileMenuUsesDarkPanel ? "text-[#8ff0c7]" : "text-[#087b68]"
                }`}
              >
                Navigation
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#00d97b] shadow-[0_0_14px_rgba(0,217,123,0.8)]" />
            </div>

            <div className="grid gap-1 p-2">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                  currentPath === "/"
                    ? "bg-[#dff9ec] text-[#087b68]"
                    : mobileMenuUsesDarkPanel
                      ? "text-white hover:bg-[#0b322d]"
                      : "text-primary-dark hover:bg-[#eaf8f3]"
                }`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border text-xl transition ${
                  currentPath === "/"
                    ? "border-[#16e08f] bg-[#0f8f73] text-white"
                    : "border-[#16e08f]/35 bg-[#082c3a] text-[#16e08f] group-hover:border-[#16e08f] group-hover:bg-[#0f463d] group-hover:text-white"
                }`}>
                  <IoHomeOutline />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold leading-tight">Home</span>
                  <span className={`mt-0.5 block text-[11px] font-semibold leading-4 ${currentPath === "/" ? "text-[#087b68]/70" : mobileMenuUsesDarkPanel ? "text-white/58" : "text-primary-gray"}`}>
                    Return to the main site
                  </span>
                </span>
              </Link>

              <a
                href={SHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobileMenu}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${mobileMenuUsesDarkPanel ? "hover:bg-[#0b322d]" : "hover:bg-[#eaf8f3]"}`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#16e08f]/35 bg-[#082c3a] text-xl text-[#16e08f] transition group-hover:border-[#16e08f] group-hover:bg-[#0f463d] group-hover:text-white">
                  <IoStorefrontOutline />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold leading-tight">Products</span>
                  <span className={`mt-0.5 block text-[11px] font-semibold leading-4 ${mobileMenuUsesDarkPanel ? "text-white/58" : "text-primary-gray"}`}>
                    Visit the TRI-P shop
                  </span>
                </span>
              </a>

              <button
                type="button"
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${mobileMenuUsesDarkPanel ? "hover:bg-[#0b322d]" : "hover:bg-[#eaf8f3]"}`}
                onClick={() => setSolutionIsClicked((open) => !open)}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#16e08f]/35 bg-[#082c3a] text-xl text-[#16e08f] transition group-hover:border-[#16e08f] group-hover:bg-[#0f463d] group-hover:text-white">
                  <IoSunnyOutline />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold leading-tight">Solutions</span>
                  <span className={`mt-0.5 block text-[11px] font-semibold leading-4 ${mobileMenuUsesDarkPanel ? "text-white/58" : "text-primary-gray"}`}>
                    Solar, CCTV, and 3D printing
                  </span>
                </span>
                <IoChevronDown className={`transition ${solutionIsClicked ? "rotate-180" : ""}`} />
              </button>

              {solutionIsClicked ? (
                <div className={`mx-3 mb-1 grid gap-1 rounded-2xl border p-2 ${mobileMenuUsesDarkPanel ? "border-white/10 bg-white/[0.03]" : "border-primary-gray bg-[#f8fcfb]"}`}>
                  {[
                    ["/services/solar", "Solar Systems"],
                    ["/services/solar", "Residential Solar"],
                    ["/services/solar", "Commercial Solar"],
                    ["/services/solar", "Battery Storage"],
                    ["/services/3d-printing", "3D Printing"],
                    ["/services/cctv-installation", "CCTV Installation"],
                  ].map(([href, label]) => (
                    <Link
                      key={`${href}-${label}`}
                      href={href}
                      onClick={closeMobileMenu}
                      className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                        currentPath === href
                          ? "bg-[#dff9ec] text-[#087b68]"
                          : mobileMenuUsesDarkPanel
                            ? "text-white/84 hover:bg-white/10"
                            : "text-primary-dark hover:bg-[#eaf8f3]"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              ) : null}

              {[
                { href: "/about", label: "About Us", helper: "Learn about TRI-P Tech", Icon: IoPersonOutline },
                { href: "/news", label: "News", helper: "Company updates and stories", Icon: IoNewspaperOutline },
                { href: "/contact", label: "Contact Us", helper: "Reach the TRI-P Tech team", Icon: IoPersonOutline },
                { href: "/services/solar/calculator", label: "Solar Calculator", helper: "Start a practical quote", Icon: IoCalculatorOutline },
              ].map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                      isActive
                        ? "bg-[#dff9ec] text-[#087b68]"
                        : mobileMenuUsesDarkPanel
                          ? "text-white hover:bg-[#0b322d]"
                          : "text-primary-dark hover:bg-[#eaf8f3]"
                    }`}
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border text-xl transition ${
                      isActive
                        ? "border-[#16e08f] bg-[#0f8f73] text-white"
                        : "border-[#16e08f]/35 bg-[#082c3a] text-[#16e08f] group-hover:border-[#16e08f] group-hover:bg-[#0f463d] group-hover:text-white"
                    }`}>
                      <item.Icon />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-extrabold leading-tight">{item.label}</span>
                      <span className={`mt-0.5 block text-[11px] font-semibold leading-4 ${isActive ? "text-[#087b68]/70" : mobileMenuUsesDarkPanel ? "text-white/58" : "text-primary-gray"}`}>
                        {item.helper}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      ) : null}

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
