"use client";
import React, { useState } from "react";
import "react-toastify/dist/ReactToastify.css"; // Import styles
import "../../../styles/global.css";
import { ToastContainer } from "react-toastify";
import {
  robotoFont,
  robotoFontBody,
  robotoFontBodyLight,
} from "../helpers/fonts";
import Image from "next/image";
import Link from "next/link";
import {
  TbCube3dSphere,
  TbDeviceCctv,
  TbSolarPanel,
} from "react-icons/tb";
import {
  IoArrowForward,
  IoEarthSharp,
  IoGlobeSharp,
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoWhatsapp,
  IoPersonSharp,
  IoWifiSharp,
} from "react-icons/io5";
import BounceInComponent from "../components/BounceInComponent";
import SlideUpComponent from "../components/SlideUpComponent";
import CountUp from "../components/CountUpAnimation";

// interface AboutPageProps {}

const AboutPage = () => {
  const [currentIndex, setCurrentIndex] = useState(1);

  const handleCarouselNext = () => {
    if (currentIndex === 3) {
      setCurrentIndex(1);
      return;
    }
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  return (
    <>
      <main className="z-2">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          progressStyle={{ backgroundColor: "#117865" }}
        />
        {/* hero */}
        <div className="landing-about flex flex-col w-full md:pt-60 pt-40 md:px-60 px-5 md:pb-24 pb-16">
          <div className="color-overlay"></div>
          <div
            className={`text-center ${robotoFont.className} md:text-[55px] text-[25px]`}
          >
            TRI-P Tech Limited builds practical power, security, and product
            development solutions for homes and businesses.
          </div>
          <div
            className={`text-center text-20 mt-10 md:text-[20px] text-[12px] ${robotoFontBodyLight.className}`}
          >
            <SlideUpComponent>
              We combine solar energy systems, CCTV installation, 3D printing,
              and product design support into solutions that solve real
              everyday problems.
            </SlideUpComponent>
          </div>
          <div className="text-white-500 mt-16 flex flex-col items-center justify-center gap-4 md:flex-row">
            <Link
              href="/contact"
              className="flex min-h-[48px] w-full max-w-[280px] items-center justify-center rounded-full border border-white bg-white px-6 py-3 text-center font-semibold text-custom-blue transition duration-200 hover:-translate-y-0.5 hover:shadow-lg md:w-auto"
            >
              Contact our team
            </Link>
            <Link
              href="/services/solar/calculator"
              className="flex min-h-[48px] w-full max-w-[280px] items-center justify-center rounded-full border border-custom-blue bg-custom-blue px-6 py-3 text-center font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg md:w-auto"
            >
              Get a quote
            </Link>
          </div>
        </div>
        {/* our story */}
        <div className="bg-white md:px-20  py-16 flex flex-col">
          <div className="flex bg-red- md:justify-start justify-center">
            <div className="text-primary-green border-2 rounded-xxl py-2 px-4">
              OUR STORY
            </div>
          </div>
          <div
            className={`${robotoFont.className} md:px-5 px-8 font-bold md:text-start text-center text-primary-dark mt-5 md:text-[40px] text-[20px]`}
          >
            Unwavering dedication to powering and securing
          </div>
          <div
            className={`${robotoFont.className} md:px-5 px-8 font-bold md:text-start text-center text-primary-green mb-10 md:text-[40px] text-[20px]`}
          >
            Nigeria and West Africa Since 2021
          </div>
          <div className="text-primary-dark md:px-0 px-5">
            <div
              className={`${robotoFontBodyLight.className} md:text-[23px] text-[15px] md:text-start text-center`}
            >
              <SlideUpComponent>
                TRI-P Tech Limited was founded with a clear purpose: to make
                practical engineering support more accessible for people who
                need reliable power, stronger security, and useful product
                development.
              </SlideUpComponent>
            </div>
            <div
              className={`${robotoFontBodyLight.className} md:text-[23px] text-[15px] md:text-start text-center mt-5`}
            >
              <SlideUpComponent>
                As demand grew for dependable backup power, better surveillance,
                and affordable prototyping, TRI-P Tech focused on building
                solutions that are practical, serviceable, and designed around
                real customer needs.
              </SlideUpComponent>
            </div>
          </div>
        </div>
        {/* what we do */}
        <div className="bg-white md:px-20  md:py-16 flex flex-col items-center md:pt-20">
          <div className="flex">
            <div className="text-primary-green border-2 rounded-xxl py-2 px-4">
              WHAT WE DO
            </div>
          </div>
          <div
            className={`${robotoFont.className} md:px-0 px-5 md:w-3/5 mt-5 font-bold text-center text-primary-dark mb-10 md:text-[40px] text-[20px]`}
          >
            We power, secure, and create practical solutions for homes and offices
          </div>

          {/* indicator */}
          <div className="flex">
            <div className="mr-3">
              <div
                onClick={() => {
                  setCurrentIndex(1);
                }}
                className={`cursor-pointer rounded-full px-[15px] py-[5px] border-2  text-[20px] ${
                  currentIndex === 1
                    ? "bg-custom-blue text-white"
                    : "bg-white text-primary-dark"
                }`}
              >
                1
              </div>
            </div>
            <div>
              <div
                onClick={() => {
                  setCurrentIndex(2);
                }}
                className={`cursor-pointer rounded-full  px-[15px] py-[5px] border-2  text-[20px] ${
                  currentIndex === 2
                    ? "bg-custom-blue text-white"
                    : "bg-white text-primary-dark"
                }`}
              >
                2
              </div>
            </div>
            <div className="ml-3">
              <div
                onClick={() => {
                  setCurrentIndex(3);
                }}
                className={`cursor-pointer rounded-full  px-[15px] py-[5px] border-2  text-[20px] ${
                  currentIndex === 3
                    ? "bg-custom-blue text-white"
                    : "bg-white text-primary-dark"
                }`}
              >
                3
              </div>
            </div>
            <div
              onClick={handleCarouselNext}
              className="text-primary-green flex items-center ml-5   border-2 border-primary-green rounded-full px-5 py-2 cursor-pointer hover:bg-primary-green hover:text-white"
            >
              <b>NEXT</b> <IoArrowForward size={20} />
            </div>
          </div>
          {/* component to slide */}
          {/* component 1 */}
          {currentIndex === 1 && (
            <div className="w-full flex my-5 md:my-0">
              {/* image half */}
              <div className="md:w-1/2 bg-red-5 md:flex hidden flex-col">
                <BounceInComponent
                  style={{ borderBottomWidth: 10, borderRightWidth: 10 }}
                  className="w-[250px] h-[250px] relative ml-5 md:block hidden z-30 border-20 rounded-lg border-white bg-white"
                >
                  <div>
                    <Image
                      className="rounded-lg"
                      layout="fill"
                      objectFit="cover"
                      alt="About Us"
                      src={"/images/heropanel.jpg"}
                      priority
                      style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                    />
                  </div>
                </BounceInComponent>
                <SlideUpComponent className="w-[450px] h-[500px] relative ml-5 md:flex hidden mt-[-190px] ml-26 self-center">
                  <div>
                    <Image
                      className="rounded-lg"
                      layout="fill"
                      objectFit="cover"
                      alt="About Us"
                      src={"/images/solar-array.jpg"}
                      priority
                      style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                    />
                  </div>
                </SlideUpComponent>
                <BounceInComponent>
                  <div className="bg-red-0 flex justify-end mt-[-150px] relative">
                    <div className="w-[200px] h-[200px] relative ml-5 md:block hidden">
                      <Image
                        className="rounded-lg"
                        layout="fill"
                        objectFit="cover"
                        alt="About Us"
                        src={"/images/solarplain.jpeg"}
                        priority
                        style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                      />
                    </div>
                  </div>
                </BounceInComponent>
              </div>
              {/* Text part */}
              <div className="md:ml-16 md:w-1/2 md:block flex flex-col justify-center md:px-0 px-5">
                <div
                  className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-green mt-5 md:text-[40px] text-[20px]`}
                >
                  Renewable Power Solutions
                </div>
                <div
                  className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark mb-5 md:text-[40px] text-[20px]`}
                >
                  For Home and Office Needs
                </div>
                <div
                  className={`${robotoFontBody.className} md:text-[23px] text-[15px] md:text-start text-center text-secondary-gray`}
                >
                  <SlideUpComponent>
                    TRI-P Tech Limited designs solar power systems that are
                    sized around real load behaviour, battery autonomy, and
                    practical installation limits.
                  </SlideUpComponent>
                </div>
                <div
                  className={`${robotoFontBody.className} md:text-[23px] text-[15px] md:text-start text-center text-secondary-gray mt-5`}
                >
                  <SlideUpComponent>
                    Our solar power solutions are engineered to provide reliable
                    and sustainable energy for homes and businesses, reducing
                    reliance on conventional power sources and minimizing carbon
                    footprints.
                  </SlideUpComponent>
                </div>
                <div
                  className={`${robotoFontBody.className} md:text-[23px] text-[15px] md:text-start text-center text-secondary-gray mt-5`}
                >
                  <SlideUpComponent>
                    We use quality components, including Tier 1 solar panels
                    where required, and focus on system performance, protection,
                    and long-term reliability.
                  </SlideUpComponent>
                </div>
                <Link
                  href="/services/solar"
                  className="mx-auto mt-5 mb-10 flex min-h-[50px] w-full max-w-[360px] items-center justify-center rounded-full border border-custom-blue bg-custom-blue px-6 py-3 text-center font-semibold text-white md:mx-0 md:mb-0 md:mt-5 md:w-fit"
                >
                  Explore Solar Services
                </Link>
              </div>
            </div>
          )}

          {/* component 2 */}
          {currentIndex === 2 && (
            <div className="w-full flex my-5 md:my-0">
              {/* image half */}
              <div className="md:w-1/2 bg-red-5 md:flex hidden flex-col">
                <BounceInComponent
                  style={{ borderBottomWidth: 10, borderRightWidth: 10 }}
                  className="w-[250px] h-[250px] relative ml-5 md:block hidden z-30 border-20 rounded-lg border-white bg-white"
                >
                  <div>
                    <Image
                      className="rounded-lg"
                      layout="fill"
                      objectFit="cover"
                      alt="About Us"
                      src={"/images/print-house.jpg"}
                      priority
                      style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                    />
                  </div>
                </BounceInComponent>
                <SlideUpComponent className="w-[450px] h-[500px] relative ml-5 md:flex hidden mt-[-190px] ml-26 self-center">
                  <div>
                    <Image
                      className="rounded-lg"
                      layout="fill"
                      objectFit="cover"
                      alt="About Us"
                      src={"/images/print-car.jpg"}
                      priority
                      style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                    />
                  </div>
                </SlideUpComponent>
                <BounceInComponent>
                  <div className="bg-red-0 flex justify-end mt-[-150px] relative">
                    <div className="w-[200px] h-[200px] relative ml-5 md:block hidden">
                      <Image
                        className="rounded-lg"
                        layout="fill"
                        objectFit="cover"
                        alt="About Us"
                        src={"/images/print.jpeg"}
                        priority
                        style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                      />
                    </div>
                  </div>
                </BounceInComponent>
              </div>
              {/* Text part */}
              <div className="md:ml-16 md:w-1/2 md:block flex flex-col justify-center md:px-0 px-5">
                <div
                  className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-green mt-5 md:text-[40px] text-[20px]`}
                >
                  3D Printing for Custom
                </div>
                <div
                  className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark mb-5 md:text-[40px] text-[20px]`}
                >
                  Home & Office Solutions
                </div>
                <div
                  className={`${robotoFontBody.className} md:text-[23px] text-[15px] md:text-start text-center text-secondary-gray`}
                >
                  <SlideUpComponent>
                    TRI-P Tech helps customers move from rough idea to usable
                    product through practical design, prototyping, and 3D
                    printing support.
                  </SlideUpComponent>
                </div>
                <div
                  className={`${robotoFontBody.className} md:text-[23px] text-[15px] md:text-start text-center text-secondary-gray mt-5`}
                >
                  <SlideUpComponent>
                    Our 3D printing solutions enable precise, customizable
                    production for both home and business needs, empowering
                    customers to bring their unique ideas to life efficiently
                    and sustainably.
                  </SlideUpComponent>
                </div>
                <div
                  className={`${robotoFontBody.className} md:text-[23px] text-[15px] md:text-start text-center text-secondary-gray mt-5`}
                >
                  <SlideUpComponent>
                    Our team of experts stays on the cutting edge of 3D printing
                    advancements, continuously learning and adapting to ensure
                    we deliver the most innovative and high-quality solutions
                    available.
                  </SlideUpComponent>
                </div>
                <Link
                  href="/services/3d-printing"
                  className="mx-auto mt-5 mb-10 flex min-h-[50px] w-full max-w-[360px] items-center justify-center rounded-full border border-custom-blue bg-custom-blue px-6 py-3 text-center font-semibold text-white md:mx-0 md:mb-0 md:mt-5 md:w-fit"
                >
                  Explore 3D printing
                </Link>
              </div>
            </div>
          )}

          {/* component 3 */}
          {currentIndex === 3 && (
            <div className="w-full flex my-5 md:my-0">
              {/* image half */}
              <div className="md:w-1/2 bg-red-5 md:flex hidden flex-col">
                <BounceInComponent
                  style={{ borderBottomWidth: 10, borderRightWidth: 10 }}
                  className="w-[250px] h-[250px] relative ml-5 md:block hidden z-30 border-20 rounded-lg border-white bg-white"
                >
                  <div>
                    <Image
                      className="rounded-lg"
                      layout="fill"
                      objectFit="cover"
                      alt="About Us"
                      src={"/images/secure-cam.jpg"}
                      priority
                      style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                    />
                  </div>
                </BounceInComponent>
                <SlideUpComponent className="w-[450px] h-[500px] relative ml-5 md:flex hidden mt-[-190px] ml-26 self-center">
                  <div>
                    <Image
                      className="rounded-lg"
                      layout="fill"
                      objectFit="cover"
                      alt="About Us"
                      src={"/images/green-cam.jpg"}
                      priority
                      style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                    />
                  </div>
                </SlideUpComponent>
                <BounceInComponent>
                  <div className="bg-red-0 flex justify-end mt-[-150px] relative">
                    <div className="w-[200px] h-[200px] relative ml-5 md:block hidden">
                      <Image
                        className="rounded-lg"
                        layout="fill"
                        objectFit="cover"
                        alt="About Us"
                        src={"/images/cctv.jpg"}
                        priority
                        style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                      />
                    </div>
                  </div>
                </BounceInComponent>
              </div>
              {/* Text part */}
              <div className="md:ml-16 md:w-1/2 md:block flex flex-col justify-center md:px-0 px-5">
                <div
                  className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-green mt-5 md:text-[40px] text-[20px]`}
                >
                  CCTV Monitoring Solutions
                </div>
                <div
                  className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark mb-5 md:text-[40px] text-[20px]`}
                >
                  For Secure Homes & Offices
                </div>
                <div
                  className={`${robotoFontBody.className} md:text-[23px] text-[15px] md:text-start text-center text-secondary-gray`}
                >
                  <SlideUpComponent>
                    TRI-P Tech plans CCTV systems around entrances, blind
                    spots, storage needs, remote viewing, and maintenance.
                  </SlideUpComponent>
                </div>
                <div
                  className={`${robotoFontBody.className} md:text-[23px] text-[15px] md:text-start text-center text-secondary-gray mt-5`}
                >
                  <SlideUpComponent>
                    Our CCTV and camera security systems are designed to deliver
                    reliable, real-time surveillance for homes and businesses,
                    enhancing safety and providing peace of mind.
                  </SlideUpComponent>
                </div>
                <div
                  className={`${robotoFontBody.className} md:text-[23px] text-[15px] md:text-start text-center text-secondary-gray mt-5`}
                >
                  <SlideUpComponent>
                    Security coverage is only useful when camera placement,
                    storage, access, and support are planned together.
                  </SlideUpComponent>
                </div>
                <Link
                  href="/services/cctv-installation"
                  className="mx-auto mt-5 mb-10 flex min-h-[50px] w-full max-w-[360px] items-center justify-center rounded-full border border-custom-blue bg-custom-blue px-6 py-3 text-center font-semibold text-white md:mx-0 md:mb-0 md:mt-5 md:w-fit"
                >
                  Explore CCTV installation
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* what we value */}
        <div className="what-we-do md:px-20  py-16 flex flex-col items-center pt-20">
          <div className="flex w-full md:justify-start justify-center bg-red-0">
            <div className="text-primary-green border-2 rounded-xxl py-2 px-4 bg-white">
              WHAT WE VALUE
            </div>
          </div>
          <div className="flex md:flex-row flex-col mt-5">
            <div
              className={` ${robotoFont.className} md:text-[55px] md:text-start text-center md:self-start self-center text-[25px] md:w-1/3 w-full`}
            >
              What guides our work
            </div>
            <div className="md:w-1/2 w-full md:ml-16 mt-5">
              <div
                className={`${robotoFontBody.className} md:text-[23px] text-[15px] md:text-start text-center text-white`}
              >
                <SlideUpComponent>
                  We believe good engineering should be useful, honest, neat,
                  and built to last. That is the standard we bring to every
                  project.
                </SlideUpComponent>
              </div>
            </div>
          </div>

          <div className="flex flex-col mt-5 w-full md:px-0 px-5">
            <div className="flex md:flex-row flex-col bg-red-0 w-full">
              <BounceInComponent className="md:w-1/2">
                <div className="bg-white rounded-lg p-5 flex flex-row items-start justify-start">
                  <div className="bg-yellow-0">
                    <IoWifiSharp
                      size={40}
                      className="text-primary-green font-bold text-[20px]"
                    />
                  </div>
                  <div className="bg-red-0 ml-5">
                    <div
                      style={{ fontWeight: "bold" }}
                      className={`${robotoFontBody.className} md:text-[15px] text-[10px] md:text-start text-center text-primary-green text-bold`}
                    >
                      Integrity and Transparency
                    </div>
                    <p
                      className={`${robotoFontBody.className} md:text-[15px] text-[10px] md:text-start text-center text-secondary-gray`}
                    >
                      We conduct our work with integrity, clear pricing, and
                      honest recommendations.
                    </p>
                  </div>
                </div>
              </BounceInComponent>

              <BounceInComponent className="md:w-1/2 md:mt-0 mt-5">
                <div className="bg-white rounded-lg p-5 flex flex-row items-start justify-start md:ml-5">
                  <div className="bg-yellow-0">
                    <IoEarthSharp
                      size={40}
                      className="text-primary-green font-bold text-[20px]"
                    />
                  </div>
                  <div className="bg-red-0 ml-5">
                    <div
                      style={{ fontWeight: "bold" }}
                      className={`${robotoFontBody.className} md:text-[15px] text-[10px] md:text-start text-center text-primary-green text-bold`}
                    >
                      Sustainability
                    </div>
                    <p
                      className={`${robotoFontBody.className} md:text-[15px] text-[10px] md:text-start text-center text-secondary-gray`}
                    >
                      We recommend solutions that reduce waste, improve energy
                      efficiency, and support long-term use.
                    </p>
                  </div>
                </div>
              </BounceInComponent>
            </div>
            <div className="flex md:flex-row flex-col bg-red-0 w-full mt-5">
              <BounceInComponent className="md:w-1/2">
                <div className="bg-white rounded-lg p-5 flex flex-row items-start justify-start">
                  <div className="bg-yellow-0">
                    <IoGlobeSharp
                      size={40}
                      className="text-primary-green font-bold text-[20px]"
                    />
                  </div>
                  <div className="bg-red-0 ml-5">
                    <div
                      style={{ fontWeight: "bold" }}
                      className={`${robotoFontBody.className} md:text-[15px] text-[10px] md:text-start text-center text-primary-green text-bold`}
                    >
                      Quality and Reliability
                    </div>
                    <p
                      className={`${robotoFontBody.className} md:text-[15px] text-[10px] md:text-start text-center text-secondary-gray`}
                    >
                      We use high-quality materials and adhere to strict
                      standards to ensure the durability of our installations
                      and products.
                    </p>
                  </div>
                </div>
              </BounceInComponent>

              <BounceInComponent className="md:w-1/2 md:mt-0 mt-5">
                <div className="bg-white rounded-lg p-5 flex flex-row items-start justify-start md:ml-5">
                  <div className="bg-yellow-0">
                    <IoPersonSharp
                      size={40}
                      className="text-primary-green font-bold text-[20px]"
                    />
                  </div>
                  <div className="bg-red-0 ml-5">
                    <div
                      style={{ fontWeight: "bold" }}
                      className={`${robotoFontBody.className} md:text-[15px] text-[10px] md:text-start text-center text-primary-green text-bold`}
                    >
                      Customer-Centric
                    </div>
                    <p
                      className={`${robotoFontBody.className} md:text-[15px] text-[10px] md:text-start text-center text-secondary-gray`}
                    >
                      We listen first, recommend carefully, and support
                      customers through the important stages of the project.
                    </p>
                  </div>
                </div>
              </BounceInComponent>
            </div>
          </div>
        </div>

        {/* Trip at a glance */}
        <div className="bg-white md:px-20  py-16 flex flex-col items-center">
          <div className="text-primary-green border-2 rounded-xxl py-2 px-4">
            TRI-P AT A GLANCE
          </div>
          <div
            className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark mt-5 mb-5 md:text-[40px] text-[20px]`}
          >
            Our Impact & Journey So Far
          </div>
          <div
            className={`text-center mt-0 text-[15px] md:text-[20px] ${robotoFontBodyLight.className} md:w-1/2 px-5 md:px-0 text-secondary-gray`}
          >
            <SlideUpComponent>
              We&apos;ve so far worked with over 180 satisfied clients and are
              still growing.
            </SlideUpComponent>
          </div>
          <div className="md:hidden w-full px-5 mt-10 space-y-5">
            <div className="overflow-hidden rounded-lg border border-primary-green/20 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <div className="relative h-[190px] w-full">
                <Image
                  className="object-cover"
                  fill
                  alt="Solar panels installed on a roof"
                  src="/images/solar-array.jpg"
                  sizes="100vw"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e8f7f3] text-primary-green">
                    <TbSolarPanel className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={`${robotoFont.className} text-[22px] font-bold leading-tight text-primary-dark`}>
                      Alternative Power Solutions
                    </h3>
                    <p className={`${robotoFontBody.className} mt-2 text-[14px] leading-6 text-secondary-gray`}>
                      We design and install practical solar systems that support homes, businesses, and essential daily power needs.
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#dce9e6] pt-4">
                  <div className="rounded-lg bg-[#f2fbf8] p-3">
                    <div className="text-[24px] font-bold text-primary-green"><CountUp target={500} addedString=" kW+" /></div>
                    <div className={`${robotoFontBody.className} text-[12px] text-secondary-gray`}>installed</div>
                  </div>
                  <div className="rounded-lg bg-[#f2fbf8] p-3">
                    <div className="text-[15px] font-bold text-primary-dark">Homes & offices</div>
                    <div className={`${robotoFontBody.className} text-[12px] text-secondary-gray`}>supported</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-primary-green/20 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <div className="relative h-[190px] w-full">
                <Image
                  className="object-cover"
                  fill
                  alt="3D printer producing a prototype"
                  src="/images/print-house.jpg"
                  sizes="100vw"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e8f7f3] text-primary-green">
                    <TbCube3dSphere className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={`${robotoFont.className} text-[22px] font-bold leading-tight text-primary-dark`}>
                      Bringing Innovative Design Concepts to Life
                    </h3>
                    <p className={`${robotoFontBody.className} mt-2 text-[14px] leading-6 text-secondary-gray`}>
                      We help turn ideas, sketches, and prototypes into usable parts and product-ready components.
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#dce9e6] pt-4">
                  <div className="rounded-lg bg-[#f2fbf8] p-3">
                    <div className="text-[24px] font-bold text-primary-green"><CountUp target={3} addedString="K+" /></div>
                    <div className={`${robotoFontBody.className} text-[12px] text-secondary-gray`}>models designed</div>
                  </div>
                  <div className="rounded-lg bg-[#f2fbf8] p-3">
                    <div className="text-[15px] font-bold text-primary-dark">Prototype</div>
                    <div className={`${robotoFontBody.className} text-[12px] text-secondary-gray`}>to product support</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-primary-green/20 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <div className="relative h-[190px] w-full">
                <Image
                  className="object-cover"
                  fill
                  alt="CCTV camera mounted for security monitoring"
                  src="/images/cctv.jpg"
                  sizes="100vw"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e8f7f3] text-primary-green">
                    <TbDeviceCctv className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={`${robotoFont.className} text-[22px] font-bold leading-tight text-primary-dark`}>
                      Securing, Monitoring & Safeguarding Spaces
                    </h3>
                    <p className={`${robotoFontBody.className} mt-2 text-[14px] leading-6 text-secondary-gray`}>
                      We install CCTV systems and monitoring setups for homes, offices, and business environments.
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#dce9e6] pt-4">
                  <div className="rounded-lg bg-[#f2fbf8] p-3">
                    <div className="text-[24px] font-bold text-primary-green"><CountUp target={500} addedString="+" /></div>
                    <div className={`${robotoFontBody.className} text-[12px] text-secondary-gray`}>systems installed</div>
                  </div>
                  <div className="rounded-lg bg-[#f2fbf8] p-3">
                    <div className="text-[15px] font-bold text-primary-dark">Homes & offices</div>
                    <div className={`${robotoFontBody.className} text-[12px] text-secondary-gray`}>secured</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* alternative power solutions */}
          <div className="hidden md:flex justify-center items-center w-full bg-blue-00">
            {/* text part */}
            <div className="md:w-1/2 md:pl-28 pl-0 flex flex-col   bg-red-00">
              <div
                className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark mt-5 mb-0 md:text-[40px] text-[20px] bg-red-0`}
              >
                Alternative Power Solutions
              </div>
              <div
                className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-green mt-0 mb-5 md:text-[40px] text-[20px]`}
              >
                For Home and Office Needs
              </div>
              <div
                className={` mt-0 md:text-[18px] text-[12px] md:text-start text-center ${robotoFontBody.className} text-secondary-gray md:w-2/3 px-5 md:px-0`}
              >
                <SlideUpComponent>
                  Harness the power of the sun with TRI-P Tech&apos;s practical
                  solar systems. We use quality components and proper sizing to
                  improve daily power reliability.
                </SlideUpComponent>
              </div>
              <div className="flex mt-5 md:justify-start justify-center">
                <div className="text-[30px] font-bold text-primary-green md:w-[120px] w-[110px]">
                  <CountUp target={500} addedString=" kW+" />
                </div>
                <div
                  className={` mt-0 text-20  md:text-[18px] text-[12px] ${robotoFontBody.className} text-secondary-gray w-1/2`}
                >
                  <b className="font-black text-black">
                    Solar arrays installed
                  </b>{" "}
                  in over 200 homes and offices across Nigeria.
                </div>
              </div>
              <div className="flex mt-5 md:justify-start justify-center">
                <div className="text-[30px] font-bold text-primary-green md:w-[120px] w-[110px]">
                  <CountUp target={1.5} addedString=" MW+" />
                </div>
                <div
                  className={` mt-0 text-20 md:text-[18px] text-[12px] ${robotoFontBody.className} text-secondary-gray w-1/2`}
                >
                  <b className="font-black text-black">
                    Battery storage installed
                  </b>{" "}
                  in over 200 homes and offices across Nigeria.
                </div>
              </div>
            </div>
            <div className="md:w-1/2 bg-yellow-0">
              <div className="w-[450px] h-[400px] relative ml-5 md:flex mt-10 hidden ml-26 self-center">
                <Image
                  className="rounded-lg"
                  layout="fill"
                  objectFit="cover"
                  alt="About Us"
                  src={"/images/solar-array.jpg"}
                  priority
                  style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                />
              </div>
            </div>
          </div>
          {/* bringing innovative design concept to life */}
          <div className="hidden md:flex justify-center items-center w-full bg-red-0 mt-10">
            {/* image part */}
            <div className="md:w-1/2 bg-yellow-0 pl-28 md:block hidden">
              <div className="w-[450px] h-[400px] relative ml-5 md:flex mt-10 hidden ml-26 self-center">
                <Image
                  className="rounded-lg"
                  layout="fill"
                  objectFit="cover"
                  alt="About Us"
                  src={"/images/print-house.jpg"}
                  priority
                  style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                />
              </div>
            </div>
            {/* text part */}
            <div className="md:w-1/2 bg-red-0 pl-0 flex flex-col">
              <div
                className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark mt-5 mb-0 md:text-[40px] text-[20px] bg-red-0`}
              >
                Bringing innovative design
              </div>
              <div
                className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-green mt-0 mb-5 md:text-[40px] text-[20px]`}
              >
                concepts to life
              </div>
              <div
                className={` mt-0 text-[12px] text-center md:text-start md:text-[18px] ${robotoFontBody.className} text-secondary-gray md:w-2/3 w-full md:px-0 px-5`}
              >
                <SlideUpComponent>
                  Bring your ideas to life with TRI-P Tech&apos;s 3D printing
                  services. We offer a range of custom printing solutions
                  tailored to your specific needs, whether for personal,
                  commercial, or industrial projects.
                </SlideUpComponent>
              </div>
              <div className="flex mt-5 justify-center md:justify-start">
                <div className="text-[30px] font-bold text-primary-green w-[70px]">
                  <CountUp target={3} addedString="K+" />
                </div>
                <div
                  className={` mt-0 text-20 text-[12px] md:text-[18px] ${robotoFontBody.className} text-secondary-gray w-1/2`}
                >
                  <b className="font-black text-black">Models designed</b> in 3D
                  printing and product design
                </div>
              </div>
            </div>
          </div>
          {/* Securing and monitoring */}
          <div className="hidden md:flex justify-center items-center w-full bg-red-0 mt-10">
            {/* text part */}
            <div className="md:w-1/2 bg-red-0 md:pl-28 flex flex-col">
              <div
                className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark mt-5 mb-0 md:text-[40px] text-[20px] bg-red-0`}
              >
                Securing, Monitoring &
              </div>
              <div
                className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-green mt-0 mb-5 md:text-[40px] text-[20px]`}
              >
                Safeguarding Africans
              </div>
              <div
                className={` mt-0 text-[12px] md:text-[18px] text-center md:text-start ${robotoFontBody.className} text-secondary-gray md:w-2/3 md:px-0 px-5`}
              >
                <SlideUpComponent>
                  Improve the safety and security of your property with TRI-P
                  Tech&apos;s CCTV installation services. We offer a range of
                  surveillance solutions tailored to meet your specific needs,
                  whether for residential, commercial, or industrial use.
                </SlideUpComponent>
              </div>

              <div className="flex mt-5 md:justify-start justify-center">
                <div className="text-[30px] font-bold text-primary-green  w-[70px]">
                  <CountUp target={500} addedString="+" />
                </div>
                <div
                  className={` mt-0 text-[12px] md:text-[18px] ${robotoFontBody.className} text-secondary-gray w-1/2`}
                >
                  <b className="font-black text-black">
                    CCTV systems installed
                  </b>{" "}
                  across homes, offices, and business sites.
                </div>
              </div>
            </div>
            <div className="md:w-1/2 bg-yellow-0 md:block hidden">
              <div className="w-[450px] h-[400px] relative ml-5 md:flex mt-10 hidden ml-26 self-center">
                <Image
                  className="rounded-lg"
                  layout="fill"
                  objectFit="cover"
                  alt="About Us"
                  src={"/images/solar-array.jpg"}
                  priority
                  style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
    </>
  );
};

export default AboutPage;
