"use client";
import React, { useState } from "react";
import "react-toastify/dist/ReactToastify.css"; // Import styles
import "../../../../styles/global.css";
import { ToastContainer } from "react-toastify";

import Image from "next/image";
import Link from "next/link";
import {
  IoArrowForward,
  IoBatteryFullSharp,
  IoCall,
  IoCallSharp,
  IoCashSharp,
  IoCheckbox,
  IoChevronDown,
  IoChevronUp,
  IoConstructSharp,
  IoEarthSharp,
  IoGlobeSharp,
  IoGridSharp,
  IoLeaf,
  IoLocationSharp,
  IoLockClosedSharp,
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoWhatsapp,
  IoMail,
  IoOpenOutline,
  IoPersonSharp,
  IoReceiptSharp,
  IoSnowSharp,
  IoSunny,
  IoSunnySharp,
  IoSyncSharp,
  IoWifiSharp,
} from "react-icons/io5";
import {
  robotoFont,
  robotoFontBody,
  robotoFontBodyLight,
} from "@/app/helpers/fonts";
import SlideUpComponent from "@/app/components/SlideUpComponent";
import BounceInComponent from "@/app/components/BounceInComponent";
import CountUp from "@/app/components/CountUpAnimation";
import { title } from "process";

// interface AboutPageProps {}

const AboutPage = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [whyCardHover1, setWhyCardHover1] = useState(false);
  const [whyCardHover2, setWhyCardHover2] = useState(false);
  const [whyCardHover3, setWhyCardHover3] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [activeStrategy, setActiveStrategy] = useState(
    "Consultative Partnership"
  );
  const [isOpen1, setIsOpen1] = useState(true);
  const [workProcess, setWorkProcess] = useState("Consultation Meeting");

  const strategyList = [
    {
      title: "Consultative Partnership",
      body: "We start by understanding the load, usage pattern, site condition, and customer expectations before recommending a solar setup.",
    },
    {
      title: "Practical system sizing",
      body: "We size the panels, battery bank, inverter, and protection items around the actual appliances and expected backup time.",
    },
    {
      title: "Budget guidance",
      body: "We help customers compare practical equipment options and understand the estimated cost before the final site inspection.",
    },
    {
      title: "Installation review",
      body: "Before final delivery, the recommended setup is reviewed against site realities such as cable route, mounting position, ventilation, and protection needs.",
    },
  ];
  const workProcessList = [
    {
      title: "Consultation Meeting",
      body: "We review your load, backup expectations, location, and budget so the recommendation starts from real usage, not guesswork.",
    },
    {
      title: "Design and Planning",
      body: "We match the inverter, battery bank, solar panels, cables, and protection devices into a practical system design.",
    },
    {
      title: "System Installation",
      body: "Our installation approach focuses on neat cable routing, safe protection, solid mounting, and dependable everyday operation.",
    },
    {
      title: "Testing and Commissioning",
      body: "We test the system, confirm key operating conditions, and hand over with practical guidance for daily use and maintenance.",
    },
  ];

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
        <div className="landing-about pb-14 flex md:flex-row flex-col w-full md:pt-40 pt-20 md:px-20 px-5 mb-0 justify-between">
          <div className="md:w-1/3 md:mt-0 mt-10">
            <div className="color-overlay"></div>
            <div
              className={`text-center md:text-start ${robotoFont.className} md:text-[50px] text-[25px]`}
            >
              Solar power systems designed for real Nigerian loads.
            </div>
            <div
              className={`text-center md:text-start  text-20 mt-0 md:text-[16px] text-[12px] ${robotoFontBodyLight.className} mt-10`}
            >
              <SlideUpComponent>
                TRI-P Tech Limited designs and installs solar systems for homes,
                offices, shops, schools, churches, and commercial facilities.
              </SlideUpComponent>
            </div>
            <div
              className={`text-center md:text-start  text-20 mt-0 md:text-[16px] text-[12px] ${robotoFontBodyLight.className} mt-10`}
            >
              <SlideUpComponent>
                We use Tier 1 solar panels, practical battery sizing, and
                proper protection planning so your system performs beyond the
                numbers on paper.
              </SlideUpComponent>
            </div>
            <div
              className={`text-center md:text-start  text-20 mt-0 md:text-[16px] text-[12px] ${robotoFontBodyLight.className} mt-10`}
            >
              <SlideUpComponent>
                Start with a guided estimate, then let our team review the site
                conditions and final engineering recommendation.
              </SlideUpComponent>
            </div>
            <div className="mt-8 flex justify-center md:justify-start">
              <a
                href="/services/solar/calculator"
                className="rounded-full bg-primary-green px-6 py-4 text-center text-sm font-bold text-white transition hover:bg-dark-green md:text-base"
              >
                Estimate your system
              </a>
            </div>
          </div>
          <div
            className="border-2 rounded-lg md:p-14 p-6 md:mt-0 mt-5 z-10 bg-white md:w-3/5"
          >
            <div className="text-primary-green border-2 rounded-xxl py-2 px-4 inline-flex">
              TRI-P Tech Solar
            </div>
            <h2
              className={`${robotoFont.className} mt-5 text-primary-dark md:text-[34px] text-[22px] font-bold`}
            >
              A complete power solution, not just equipment supply.
            </h2>
            <p
              className={`${robotoFontBodyLight.className} mt-5 text-primary-dark md:text-[17px] text-[14px] leading-7`}
            >
              We combine load assessment, Tier 1 solar panels, product
              selection, protection planning, installation quality, and
              after-sales support to guarantee exceptional results.
            </p>
            <div className="mt-7 grid gap-3">
              {[
                "Residential and commercial solar systems",
                "Battery backup and hybrid inverter solutions",
                "Tier 1 solar panels with practical protection planning",
              ].map((item) => (
                <div key={item} className="flex items-center text-primary-dark">
                  <IoCheckbox className="mr-3 text-[22px] text-primary-green" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <a
              href="/services/solar/calculator"
              className="mt-8 inline-flex w-full justify-center rounded-full bg-custom-blue py-4 text-center font-bold text-white"
            >
              Use the solar calculator
            </a>
          </div>
        </div>
        {/* hero bottom bar */}
        <div className="md:px-40 px-20 pb-10 flex flex-col bg-white items-center">
          <div className="flex md:flex-row flex-col md:justify-between items-center md:items-start md:mt-10 mt-8">
            <div className="md:w-1/4 md:block flex flex-col items-center">
              <IoSnowSharp className="text-[40px] text-primary-dark" />
              <div className="text-primary-dark text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                5+ years material warranty
              </div>
              <div
                className={`${robotoFontBodyLight.className} text-center md:text-start text-primary-dark  text-[15px] mt-7`}
              >
                <SlideUpComponent>
                  Quality components and clear warranty support help protect
                  the value of your installation.
                </SlideUpComponent>
              </div>
            </div>

            <div className="md:w-1/4 md:block flex flex-col items-center">
              <IoCallSharp className="text-[40px] text-primary-dark" />
              <div className="text-primary-dark text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                Responsive customer support
              </div>
              <div
                className={`${robotoFontBodyLight.className} text-center md:text-start text-primary-dark  text-[15px] mt-7`}
              >
                <SlideUpComponent>
                  Our team remains available for guidance, after-installation
                  support, and technical follow-up.
                </SlideUpComponent>
              </div>
            </div>

            <div className="md:w-1/4 md:block flex flex-col items-center">
              <IoReceiptSharp className="text-[40px] text-primary-dark" />
              <div className="text-primary-dark text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                Free quote review
              </div>
              <div
                className={`${robotoFontBodyLight.className} text-center md:text-start text-primary-dark  text-[15px] mt-7`}
              >
                <SlideUpComponent>
                  Get an initial estimate before committing to a full site
                  inspection or final engineering review.
                </SlideUpComponent>
              </div>
            </div>
          </div>
        </div>

        {/* calculator callout */}
        <section className="bg-white px-5 py-14 md:px-20">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-lg border border-[#d8e7e3] bg-[#f4faf8] p-6 md:flex-row md:items-center md:p-10">
            <div className="max-w-2xl">
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-primary-green">
                Solar estimate tool
              </div>
              <h2
                className={`${robotoFont.className} mt-3 text-primary-dark md:text-[34px] text-[24px] font-bold`}
              >
                Estimate your solar system before requesting a final quote.
              </h2>
              <p
                className={`${robotoFontBodyLight.className} mt-4 text-primary-dark md:text-[16px] text-[14px] leading-7`}
              >
                Enter your appliances and usage hours, then review the suggested
                panels, battery bank, inverter, protection items, and estimated
                equipment cost. Our team will still confirm the final design.
              </p>
            </div>
            <a
              href="/services/solar/calculator"
              className="inline-flex rounded-full bg-primary-green px-6 py-4 text-sm font-bold text-white transition hover:bg-dark-green md:text-base"
            >
              Use solar calculator
            </a>
          </div>
        </section>

        {/* why choose trip tech solar */}
        <div className="bg-light-blue md:px-20 px-5  py-16 flex flex-col items-center">
          <div className="flex md:flex-row flex-col  justify-center items-center">
            <div
              className={`md:w-2/5 w-full text-black bg-red-00 flex flex-col md:items-start items-center`}
            >
              <div className="flex flex-row">
                <div className="text-primary-green border-2 rounded-xxl py-2 px-4">
                  Why choose TRI-P Tech
                </div>
              </div>
              <div
                className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark mt-5 mb-10 md:text-[40px] text-[20px]`}
              >
                Why choose TRI-P for your solar project
              </div>
              <p
                className={`${robotoFontBody.className} md:text-[18px] text-[15px] md:text-start text-center`}
              >
                We do not size solar systems by guesswork. Every recommendation
                is built around load behaviour, backup expectations, and
                practical installation limits.
              </p>
              <p
                className={`${robotoFontBody.className} md:text-[18px] text-[15px] md:text-start text-center mt-5`}
              >
                At TRI-P Tech Limited, we combine Tier 1 solar panels,
                dependable inverters, correctly matched batteries, and
                protection devices that make the installation safer and easier
                to maintain.
              </p>
              <p
                className={`${robotoFontBody.className} md:text-[18px] text-[15px] md:text-start text-center mt-5`}
              >
                Our goal is simple: build solar systems that perform
                exceptionally well in real daily use.
              </p>
            </div>
            {/* <BounceInComponent> */}
            <div className="md:w-2/5 w-full relative md:ml-1  md:mt-0 mt-10">
              {/* why-cards */}
              <div
                onMouseEnter={() => {
                  setWhyCardHover1(true);
                }}
                onMouseLeave={() => {
                  setWhyCardHover1(false);
                }}
                className={
                  whyCardHover1
                    ? `flex flex-row items-center bg-dark-green rounded-lg p-5`
                    : `flex flex-row items-center bg-white rounded-lg p-5`
                }
              >
                <div
                  className={
                    whyCardHover1
                      ? `rounded-full bg-white p-3`
                      : `rounded-full bg-dark-green p-3`
                  }
                >
                  <IoSnowSharp
                    className={
                      whyCardHover1
                        ? `text-[35px] text-dark-green`
                        : `text-[35px] text-white`
                    }
                  />
                </div>
                <div
                  className={
                    whyCardHover1 ? `text-white ml-3` : `text-dark-green ml-3`
                  }
                >
                  <div
                    className={`${robotoFont.className} md:text-[18px] text-[15px]`}
                  >
                    Save money on electricity bills
                  </div>
                  <div className="mt-3  md:text-[16px] text-[13px]">
                    A properly sized solar system can reduce generator use,
                    lower energy stress, and improve power availability.
                  </div>
                </div>
              </div>
              <div
                onMouseEnter={() => {
                  setWhyCardHover2(true);
                }}
                onMouseLeave={() => {
                  setWhyCardHover2(false);
                }}
                className={
                  whyCardHover2
                    ? `flex flex-row items-center bg-dark-green rounded-lg p-5 mt-5`
                    : `flex flex-row items-center bg-white rounded-lg p-5 mt-5`
                }
              >
                <div
                  className={
                    whyCardHover2
                      ? `rounded-full bg-white p-3`
                      : `rounded-full bg-dark-green p-3`
                  }
                >
                  <IoSunny
                    className={
                      whyCardHover2
                        ? `text-[35px] text-dark-green`
                        : `text-[35px] text-white`
                    }
                  />
                </div>
                <div
                  className={
                    whyCardHover2 ? `text-white ml-3` : `text-dark-green ml-3`
                  }
                >
                  <div
                    className={`${robotoFont.className}  md:text-[18px] text-[15px]`}
                  >
                    Reliable backup power
                  </div>
                  <div className="mt-3  md:text-[16px] text-[13px]">
                    We help homes and businesses stay productive during grid
                    failure, low supply, and unstable power conditions.
                  </div>
                </div>
              </div>
              <div
                onMouseEnter={() => {
                  setWhyCardHover3(true);
                }}
                onMouseLeave={() => {
                  setWhyCardHover3(false);
                }}
                className={
                  whyCardHover3
                    ? `flex flex-row items-center bg-dark-green rounded-lg p-5 mt-5`
                    : `flex flex-row items-center bg-white rounded-lg p-5 mt-5`
                }
              >
                <div
                  className={
                    whyCardHover3
                      ? `rounded-full bg-white p-3`
                      : `rounded-full bg-dark-green p-3`
                  }
                >
                  <IoLeaf
                    className={
                      whyCardHover3
                        ? `text-[35px] text-dark-green`
                        : `text-[35px] text-white`
                    }
                  />
                </div>
                <div
                  className={
                    whyCardHover3 ? `text-white ml-3` : `text-dark-green ml-3 `
                  }
                >
                  <div
                    className={`${robotoFont.className}  md:text-[18px] text-[15px]`}
                  >
                    Environmentally Friendly
                  </div>
                  <div className="mt-3  md:text-[16px] text-[13px]">
                    Solar energy reduces dependence on fuel generators and
                    supports cleaner everyday power.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* strategic approach */}
        <div className="bg-white md:px-20 px-5  py-16 flex flex-col">
          <div
            className={`${robotoFont.className} md:px-0 px-0 font-bold md:text-start text-center text-primary-dark mt-5 mb-10 md:text-[45px] text-[20px] w-full`}
          >
            We follow a practical engineering approach focused on performance,
            safety, and exceptional results
          </div>
          <div className="flex flex-row  justify-start">
            {/* image */}
            <div className="w-2/5 relative flex flex-col  md:block hidden">
              <BounceInComponent>
                <div className="h-[400px] relative">
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
            </div>
            {/* text */}
            <div className={`md:w-2/5 w-full text-black md:ml-20 m-0`}>
              {/* <div>
                <div className="flex flex-row justify-between w-full items-center cursor-pointer">
                  <div className={`${robotoFontBody.className}`}>
                    Consultative partnership
                  </div>
                  <IoChevronDown />
                </div>
                <hr className="border-t border-gray-300 my-4" />
              </div> */}
              {strategyList.map((value, key) => (
                <div>
                  {/* Header Section */}
                  <div
                    className="flex flex-row justify-between w-full items-center cursor-pointer"
                    onClick={() => {
                      setIsOpen(!(isOpen && activeStrategy === value.title));
                      setActiveStrategy(value?.title);
                    }}
                  >
                    <div
                      className={`${robotoFont.className} text-primary-dark`}
                    >
                      {value.title}
                    </div>
                    {isOpen && activeStrategy === value.title ? (
                      <IoChevronUp />
                    ) : (
                      <IoChevronDown />
                    )}
                  </div>
                  <hr className="border-t border-gray-300 my-4" />

                  {/* Collapsible Content */}
                  <div
                    className={`mb-5 overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                      isOpen && activeStrategy === value.title
                        ? "max-h-[200px]"
                        : "max-h-0"
                    }`}
                  >
                    <p className="text-red-00 md:text-[18px] text-[13px]">
                      {value.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* IMPECABLE */}
        <div className="bg-white md:px-20 px-5  py-16 flex flex-col items-center pt-20">
          <div className="impeccable md:px-20 px-5  py-16 flex flex-col items-center md:pt-20 pt-10 rounded-xl">
            <div className="flex w-full md:justify-start justify-center bg-red-0">
              <div className="text-dark-green-1 border-2 rounded-xxl py-2 px-4 bg-white">
                WHAT WE VALUE
              </div>
            </div>
            <div className="flex md:flex-row flex-col mt-5 w-full">
              <div
                className={` ${robotoFont.className} md:text-[35px] md:text-start text-center self-start md:text-[25px] text-[18px] w-full`}
              >
                We use Tier 1 solar panels, reliable inverters, strong mounting,
                and properly matched battery storage to protect system
                performance.
              </div>
            </div>

            <div className="flex flex-col mt-5 w-full md:px-0 px-0">
              <div className="flex md:flex-row flex-col bg-red-0 w-full">
                <BounceInComponent className="md:w-1/2">
                  <div className=" rounded-lg p-5 flex flex-row items-start justify-start ">
                    <div className="bg-yellow-0 bg-white p-3 rounded-lg">
                      <IoSunnySharp
                        size={40}
                        className="text-primary-dark font-bold text-[20px]"
                      />
                    </div>
                    <div className="bg-red-0 ml-5">
                      <div
                        style={{ fontWeight: "bold" }}
                        className={`${robotoFontBody.className} md:text-[15px] text-[10px] text-start text-white text-bold`}
                      >
                        Tier 1 solar panels
                      </div>
                      <p
                        className={`${robotoFontBodyLight.className} md:text-[15px] text-[10px] text-start text-white`}
                      >
                        High-efficiency panels selected for stronger output,
                        durability, and long-term system confidence.
                      </p>
                    </div>
                  </div>
                </BounceInComponent>

                <BounceInComponent className="md:w-1/2">
                  <div className=" rounded-lg p-5 flex flex-row items-start justify-start">
                    <div className="bg-yellow-0 bg-white p-3 rounded-lg">
                      <IoSyncSharp
                        size={40}
                        className="text-primary-dark font-bold text-[20px]"
                      />
                    </div>
                    <div className="bg-red-0 ml-5">
                      <div
                        style={{ fontWeight: "bold" }}
                        className={`${robotoFontBody.className} md:text-[15px] text-[10px] text-start text-white text-bold`}
                      >
                        Reliable inverter systems
                      </div>
                      <p
                        className={`${robotoFontBodyLight.className} md:text-[15px] text-[10px] text-start text-white`}
                      >
                        Inverters are matched to the load, battery voltage, and
                        expected surge demand.
                      </p>
                    </div>
                  </div>
                </BounceInComponent>
              </div>
              <div className="flex md:flex-row flex-col bg-red-0 w-full mt-5">
                <BounceInComponent className="md:w-1/2">
                  <div className=" rounded-lg p-5 flex flex-row items-start justify-start">
                    <div className="bg-yellow-0 bg-white p-3 rounded-lg">
                      <IoConstructSharp
                        size={40}
                        className="text-primary-dark font-bold text-[20px]"
                      />
                    </div>
                    <div className="bg-red-0 ml-5">
                      <div
                        style={{ fontWeight: "bold" }}
                        className={`${robotoFontBody.className} md:text-[15px] text-[10px] text-start text-white text-bold`}
                      >
                        Robust mounting systems
                      </div>
                      <p
                        className={`${robotoFontBodyLight.className} md:text-[15px] text-[10px] text-start text-white`}
                      >
                        Mounting accessories are selected to keep panels secure,
                        neat, and serviceable.
                      </p>
                    </div>
                  </div>
                </BounceInComponent>

                <BounceInComponent className="md:w-1/2">
                  <div className=" rounded-lg p-5 flex flex-row items-start justify-start">
                    <div className="bg-yellow-0 bg-white p-3 rounded-lg">
                      <IoBatteryFullSharp
                        size={40}
                        className="text-primary-dark font-bold text-[20px]"
                      />
                    </div>
                    <div className="bg-red-0 ml-5">
                      <div
                        style={{ fontWeight: "bold" }}
                        className={`${robotoFontBody.className} md:text-[15px] text-[10px] text-start text-white text-bold`}
                      >
                        Energy Storage Solutions
                      </div>
                      <p
                        className={`${robotoFontBodyLight.className} md:text-[15px] text-[10px] text-start text-white`}
                      >
                        Expandable lithium battery options sized for backup
                        time, battery depth of discharge, and daily recharge
                        expectations.
                      </p>
                    </div>
                  </div>
                </BounceInComponent>
              </div>
            </div>
          </div>
        </div>
        {/* How we work */}
        <div className="bg-white md:px-20 px-5  py-16 flex flex-col">
          <div className="flex flex-row bg-red-00 md:justify-start justify-center">
            <div className="text-primary-green border-2 rounded-xxl py-2 px-4">
              How we work
            </div>
          </div>

          <div className="flex md:flex-row flex-col justify-start w-full">
            <div
              className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark mt-5 md:mb-10 mb-5 md:text-[45px] text-[20px] md:w-2/5 w-full`}
            >
              A clear process from estimate to installation
            </div>
            <div
              className={`${robotoFontBody.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark md:mt-5 mb-10 md:text-[20px] text-[15px]  md:w-2/5 w-full md:ml-20 `}
            >
              From the first estimate to final commissioning, we keep the
              process clear, practical, and focused on a system that works.
            </div>
          </div>
          <div className="flex md:flex-row flex-col  justify-start">
            {/* image */}
            <div className="md:w-2/5 relative flex flex-col">
              <BounceInComponent className="  md:block hidden">
                <div className="h-[400px] relative">
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
              <div className="flex justify-center w-full">
                <button
                  // disabled={mailLoading}
                  type="submit"
                  className="bg-custom-blue md:mt-10 text-center py-4 rounded-full w-full"
                >
                  {/* D545A49D */}
                  Speak with Our Engineers
                </button>
              </div>
            </div>
            {/* text */}
            <div className={`md:w-2/5 w-full text-black md:ml-20 mt-5`}>
              {workProcessList.map((value, key) => (
                <div key={key} className=" bg-light-blue p-5 mb-5 rounded-lg">
                  {/* Header Section */}
                  <div
                    className="flex flex-row justify-between w-full items-center cursor-pointer"
                    onClick={() => {
                      setIsOpen1(!(isOpen1 && workProcess === value.title));
                      setWorkProcess(value?.title);
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        className={`${robotoFont.className} text-white py-1 px-3 bg-dark-blue rounded-full`}
                      >
                        {key + 1}
                      </div>
                      <div
                        className={`${robotoFont.className} text-primary-dark ml-5`}
                      >
                        {value.title}
                      </div>
                    </div>
                    {isOpen1 && workProcess === value.title ? (
                      <IoChevronUp />
                    ) : (
                      <IoChevronDown />
                    )}
                  </div>

                  {/* Collapsible Content */}
                  <div
                    className={` overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                      isOpen1 && workProcess === value.title
                        ? "max-h-[200px]"
                        : "max-h-0"
                    }`}
                  >
                    <br />
                    <p className="text-gray-700  md:text-[18px] text-[13px]">
                      {value.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* energy impact */}
        <div className="flex md:flex-row flex-col bg-white md:px-40 md:py-16 md:items-start items-center  md:justify-between md:pb-0 pb-5">
          <div className="md:w-3/5  relative w-5/6  md:pr-10">
            <div className="flex">
              <div className="text-primary-green border-2 rounded-xxl py-2 px-4">
                OUR ENERGY IMPACT
              </div>
            </div>
            <div
              className={`${robotoFont.className} font-bold  text-primary-dark mt-2 md:text-[40px] text-[20px] font-[700px]`}
            >
              Harvesting the Power of
            </div>
            <div
              className={`${robotoFont.className} font-bold  text-primary-green md:text-[40px] text-[20px] font-[700px]`}
            >
              the Sun for Your Needs
            </div>
            <div
              className={`${robotoFontBodyLight.className} text-black md:text-[20px] text-[10px] mt-5`}
              >
                <SlideUpComponent>
                TRI-P Tech builds smart and affordable power solutions for
                homes, offices, and businesses. Our solar and battery systems
                are planned around real energy needs, practical installation,
                and reliable everyday backup.
                </SlideUpComponent>
            </div>
            <div className="flex flex-row md:text-start items-center justify-between md:mt-10 mt-5">
              <div>
                <div
                  className={`${robotoFontBody.className} font-[500px]  text-primary-green md:text-[55px] text-[25px] font-bold`}
                >
                  <CountUp target={4} duration={5000} addedString="+" />
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-black md:text-start text-center md:text-[20px] text-[7px] mt-2 w-1/2`}
                >
                  Years of Experience
                </div>
              </div>

              <div>
                <div
                  className={`${robotoFontBody.className} font-[500px]  text-primary-green md:text-[55px] text-[25px]`}
                >
                  <CountUp target={200} duration={5000} addedString="+" />
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-black md:text-[20px] text-[7px] mt-2 w-1/2`}
                >
                  Projects Completed
                </div>
              </div>

              <div>
                  <div
                    className={`${robotoFontBody.className} font-[500px] text-primary-green md:text-[55px] text-[25px]`}
                  >
                  <CountUp target={500} duration={5000} addedString=" kW+" />
                  </div>
                  <div
                    className={`${robotoFontBodyLight.className} text-black md:text-[20px] text-[7px] mt-2 w-1/2`}
                  >
                  Solar Capacity Installed
                  </div>
              </div>
            </div>
          </div>
          <div className="w-2/5 h-[500px] relative md:block hidden md:ml-10">
            <Image
              className="rounded-lg"
              layout="fill"
              objectFit="cover"
              alt="About Us"
              src={"/images/house-solar.jpg"}
              priority
            />
          </div>
        </div>
      </main>

      
    </>
  );
};

export default AboutPage;
