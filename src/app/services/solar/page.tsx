"use client";
import React, { useState } from "react";
import "react-toastify/dist/ReactToastify.css"; // Import styles
import "../../../../styles/global.css";
import { ToastContainer } from "react-toastify";

import Image from "next/image";
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
import AreaInputComponent from "@/app/components/AreaInputComponent";
import InputComponent from "@/app/components/InputComponent";
import SelectInputComponent from "@/app/components/SelectInputComponent";
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
      body: "Our team of skilled engineers and designers bring extensive experience and knowledge to every project, guaranteeing exceptional results. Our skilled engineers are committed to delivering high-quality surveillance systems that meet your exact specifications and exceed your expectations. Our innovative approach and use of advanced technology enable us to provide the most effective and reliable security solutions.",
    },
    {
      title: "Customizable Solutions",
      body: "Our team of skilled engineers and designers bring extensive experience and knowledge to every project, guaranteeing exceptional results. Our skilled engineers are committed to delivering high-quality surveillance systems that meet your exact specifications and exceed your expectations. Our innovative approach and use of advanced technology enable us to provide the most effective and reliable security solutions.",
    },
    {
      title: "Instalmental Payment Plan",
      body: "Our team of skilled engineers and designers bring extensive experience and knowledge to every project, guaranteeing exceptional results. Our skilled engineers are committed to delivering high-quality surveillance systems that meet your exact specifications and exceed your expectations. Our innovative approach and use of advanced technology enable us to provide the most effective and reliable security solutions.",
    },
    {
      title: "Expert Team",
      body: "Our team of skilled engineers and designers bring extensive experience and knowledge to every project, guaranteeing exceptional results. Our skilled engineers are committed to delivering high-quality surveillance systems that meet your exact specifications and exceed your expectations. Our innovative approach and use of advanced technology enable us to provide the most effective and reliable security solutions.",
    },
  ];
  const workProcessList = [
    {
      title: "Consultation Meeting",
      body: "Using high-quality materials and expert techniques, we install your solar system with precision that meet your exact specifications and exceed your expectations.",
    },
    {
      title: "Design and Planning",
      body: "Using high-quality materials and expert techniques, we install your solar system with precision that meet your exact specifications and exceed your expectations.",
    },
    {
      title: "System Installation",
      body: "Using high-quality materials and expert techniques, we install your solar system with precision that meet your exact specifications and exceed your expectations.",
    },
    {
      title: "Testing and Commissioning",
      body: "Using high-quality materials and expert techniques, we install your solar system with precision that meet your exact specifications and exceed your expectations.",
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
              Get your free personlized solar quote today from our experts.
            </div>
            <div
              className={`text-center md:text-start  text-20 mt-0 md:text-[16px] text-[12px] ${robotoFontBodyLight.className} mt-10`}
            >
              <SlideUpComponent>
                Please fill our quote inquiry form and one of our experts will
                get in touch with you within 24 hours.
              </SlideUpComponent>
            </div>
            <div
              className={`text-center md:text-start  text-20 mt-0 md:text-[16px] text-[12px] ${robotoFontBodyLight.className} mt-10`}
            >
              <SlideUpComponent>
                Take the first step towards a brighter, cleaner, and more
                cosr-effectiv e future. Conatct us for free a personalized quote
                and discover the countless benefits of switching to alternative
                energy.
              </SlideUpComponent>
            </div>
            <div
              className={`text-center md:text-start  text-20 mt-0 md:text-[16px] text-[12px] ${robotoFontBodyLight.className} mt-10`}
            >
              <SlideUpComponent>
                Connect with our experts to review your solar power needs, cctv
                system or 3d printing needs either over the phone or in-person.
              </SlideUpComponent>
            </div>
          </div>
          {/* form */}
          {/* <div className="bg-white relative md:p-32 p-8"> */}
          {/* form-div */}
          <div
            className="border-2 rounded-lg md:p-20 p-5 md:mt-0 mt-5 absolutes z-10 bg-white md:w-3/5"
            style={{
              top: 0,
              // left: "50%",
              // transform: "translateX(-50%)",
            }}
          >
            <form>
              <div className="flex md:flex-row flex-col w-full justify-between items-center mb-5">
                <div className="flex flex-col w-full">
                  <InputComponent
                    required
                    placeholder="e.g youremail@gmail.com"
                    label="Email"
                    name="email"
                  />
                </div>
              </div>
              <div className="flex md:flex-row flex-col w-full justify-between items-center">
                <div className="flex flex-col w-full">
                  <InputComponent
                    required
                    placeholder="e.g John Doe"
                    label="Full Name"
                    name="fullName"
                  />
                </div>
                <div className="flex flex-col w-full md:ml-5 ml-0 mt-3 md:mt-0">
                  <InputComponent
                    required
                    placeholder="Enter phone"
                    label="Phone number"
                    name="phone"
                  />
                </div>
              </div>
              <div className="flex md:flex-row flex-col w-full justify-between items-center mt-5">
                <div className="flex flex-col w-full md:ml-0 ml-0 mt-3 md:mt-0">
                  <SelectInputComponent
                    data={["Residential Solar Installation"]}
                    required
                    name="serviceRequired"
                    label="Service required"
                    placeholder="Select a service"
                  />
                </div>
                <div className="flex flex-col w-full md:ml-5 ml-0 mt-3 md:mt-0">
                  <SelectInputComponent
                    data={[
                      "12 - 20 Compactments",
                      "21 - 40 Compactments",
                      "41 - 60 Compactments",
                    ]}
                    required
                    name="serviceRequired"
                    label="Number of panels required"
                    placeholder="Select number of panels"
                  />
                </div>
              </div>
              <div className="flex flex-row w-full justify-between items-center mt-5">
                <div className="flex flex-col w-full">
                  <AreaInputComponent
                    type="text"
                    placeholder="Enter more information about the specifics on the service you want a quote on (Optional)."
                    label="Description"
                    name="appointmentDetails"
                  />
                </div>
              </div>

              <div className="flex justify-center w-full">
                <button
                  // disabled={mailLoading}
                  type="submit"
                  className="bg-custom-blue mt-10 text-center py-4 rounded-full w-full"
                >
                  {/* D545A49D */}
                  {/* {mailLoading ? "Please wait..." : " Submit Request"} */}
                  Get in touch
                </button>
              </div>
            </form>
          </div>
        </div>
        {/* hero bottom bar */}
        <div className="md:px-40 px-20 pb-10 flex flex-col bg-white items-center">
          <div className="flex md:flex-row flex-col md:justify-between items-center md:items-start md:mt-10 mt-8">
            <div className="md:w-1/4 md:block flex flex-col items-center">
              <IoSnowSharp className="text-[40px] text-primary-dark" />
              <div className="text-primary-dark text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                5+ Years Material Warranty
              </div>
              <div
                className={`${robotoFontBodyLight.className} text-center md:text-start text-primary-dark  text-[15px] mt-7`}
              >
                <SlideUpComponent>
                  We're on a mission to providing reliable power, security
                  systems as well as parts and products.
                </SlideUpComponent>
              </div>
            </div>

            <div className="md:w-1/4 md:block flex flex-col items-center">
              <IoCallSharp className="text-[40px] text-primary-dark" />
              <div className="text-primary-dark text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                24/7 Customer Support
              </div>
              <div
                className={`${robotoFontBodyLight.className} text-center md:text-start text-primary-dark  text-[15px] mt-7`}
              >
                <SlideUpComponent>
                  We're on a mission to providing reliable power, security
                  systems as well as parts and products.
                </SlideUpComponent>
              </div>
            </div>

            <div className="md:w-1/4 md:block flex flex-col items-center">
              <IoReceiptSharp className="text-[40px] text-primary-dark" />
              <div className="text-primary-dark text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                Free Quotation
              </div>
              <div
                className={`${robotoFontBodyLight.className} text-center md:text-start text-primary-dark  text-[15px] mt-7`}
              >
                <SlideUpComponent>
                  We're on a mission to providing reliable power, security
                  systems as well as parts and products.
                </SlideUpComponent>
              </div>
            </div>
          </div>
        </div>

        {/* why choose trip tech solar */}
        <div className="bg-light-blue md:px-20 px-5  py-16 flex flex-col items-center">
          <div className="flex md:flex-row flex-col  justify-center items-center">
            <div
              className={`md:w-2/5 w-full text-black bg-red-00 flex flex-col md:items-start items-center`}
            >
              <div className="flex flex-row">
                <div className="text-primary-green border-2 rounded-xxl py-2 px-4">
                  Why choose Tri-P Tech
                </div>
              </div>
              <div
                className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark mt-5 mb-10 md:text-[40px] text-[20px]`}
              >
                Why choose Tri-P for your solar project
              </div>
              <p
                className={`${robotoFontBody.className} md:text-[18px] text-[15px] md:text-start text-center`}
              >
                Harnessing the power of the sun is a smart sustainable way to
                power our homes and yet a universal right
              </p>
              <p
                className={`${robotoFontBody.className} md:text-[18px] text-[15px] md:text-start text-center mt-5`}
              >
                In an era of rising energy costs and growing environmental
                awareness, solar energy has emerged as a vital solution for
                sustainable power. At TRI-P Tech, we specialize in providing
                top-tier solar installation services .
              </p>
              <p
                className={`${robotoFontBody.className} md:text-[18px] text-[15px] md:text-start text-center mt-5`}
              >
                Our comprehensive solutions are designed to meet the energy
                needs of residential, commercial, and industrial clients.
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
                    Save Money on Electicity Bills
                  </div>
                  <div className="mt-3  md:text-[16px] text-[13px]">
                    Our solar solutions help clients save on energy costs,
                    contributing to financial stability and growth
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
                    Reserve Energy Production
                  </div>
                  <div className="mt-3  md:text-[16px] text-[13px]">
                    We empower individuals and businesses to achieve energy
                    independence and resilience free from grid failure and
                    inefficienceis
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
                    By promoting the use of renewable energy, we help reduce
                    carbon emissions and combat climate change.
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
            We follow a strategic approach focused on delivering excellence and
            reliability
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
                We use the highest quality materials and components to ensure
                the longevity and efficiency of your solar power system
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
                        Sunpower High-Efficiency Solar Panels (750W)
                      </div>
                      <p
                        className={`${robotoFontBodyLight.className} md:text-[15px] text-[10px] text-start text-white`}
                      >
                        Premium-grade panels that offer maximum energy
                        conversion and durability. Best in class import from
                        sweden.
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
                        AI Integrated Advanced Inverters With External Malpad
                      </div>
                      <p
                        className={`${robotoFontBodyLight.className} md:text-[15px] text-[10px] text-start text-white`}
                      >
                        Reliable inverters that optimize the performance of your
                        solar system.
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
                        Robust Mounting Systems (Free Battery Suspenders)
                      </div>
                      <p
                        className={`${robotoFontBodyLight.className} md:text-[15px] text-[10px] text-start text-white`}
                      >
                        Durable mounting solutions designed to withstand various
                        environmental conditions. Alongside free battery
                        suspenders.
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
                        Expandable 13Wh battery Lithium ion battery with
                        High-capacity batteries for efficient energy storage and
                        utilization in winter and any other season.
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
              Seamless & Efficient Customer Experience
            </div>
            <div
              className={`${robotoFontBody.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark md:mt-5 mb-10 md:text-[20px] text-[15px]  md:w-2/5 w-full md:ml-20 `}
            >
              Our process is designed to be seamless and efficient, ensuring a
              smooth experience from start to finish, with or without
              environmental interferences
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
                  {/* {mailLoading ? "Please wait..." : " Submit Request"} */}
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
                Harnessing the power of the sun is a smart sustainable way to
                power our homes and yet a universal right In an era of rising
                energy costs and growing environmental awareness, solar energy
                has emerged as a vital solution for sustainable power and
                alternative energy supply.
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
                  <CountUp target={12} duration={5000} addedString="k KW" />
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-black md:text-[20px] text-[7px] mt-2 w-1/2`}
                >
                  Energy Generated
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

      <footer className="bg-primary-dark md:px-28 px-7 py-20 flex md:flex-row flex-col items-center">
        <div className="md:w-1/3 md:mr-20">
          <Image
            style={{ zIndex: 2 }}
            // layout="responsive"
            height={100}
            width={200}
            alt="Logo"
            src={"/images/logo/white-logo-text.png"}
            priority
          />
          <div
            className={`${robotoFontBodyLight.className} text-white md:text-[15px] md:text-[15px] text-[10px] mt-7`}
          >
            Experts in CCTV installation, Solar Systemts installation, 3D
            Printing and Modelling, Prototyping and Design Consultation
            Services. Contact us anytime to get a free quote.
          </div>
          <div className="flex flex-row mt-10">
            <a
              className="rounded-full"
              href={process.env.NEXT_PUBLIC_FACEBOOKPAGE}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLogoFacebook className="text-[50px] rounded-full text-primary-dark bg-white p-3" />
            </a>
            <a
              className="rounded-full ml-8"
              href={process.env.NEXT_PUBLIC_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLogoInstagram className="text-[50px] rounded-full text-primary-dark bg-white p-3" />
            </a>
            <a
              className="rounded-full ml-8"
              href={process.env.NEXT_PUBLIC_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLogoLinkedin className="text-[50px] rounded-full text-primary-dark bg-white p-3" />
            </a>
            <IoLogoWhatsapp className="text-[50px] rounded-full text-primary-dark bg-white p-3 ml-8" />
            {/* <IoLogoTwitter className="text-[50px] rounded-full text-primary-dark bg-white p-3 ml-8" /> */}
          </div>
        </div>
        <div className="flex flex-row md:mt-0 mt-10">
          <div>
            <div className="font-bold">Our Solutions</div>
            <div
              className={`${robotoFontBodyLight.className} text-white md:text-[15px] text-[10px] mt-5`}
            >
              Solar Systems
            </div>
            <div
              className={`${robotoFontBodyLight.className} text-white md:text-[15px] text-[10px] mt-5`}
            >
              Residential Solar
            </div>
            <div
              className={`${robotoFontBodyLight.className} text-white md:text-[15px] text-[10px] mt-5`}
            >
              Commercial Solar
            </div>
            <div
              className={`${robotoFontBodyLight.className} text-white md:text-[15px] text-[10px] mt-5`}
            >
              Battery Storage
            </div>
          </div>

          <div className="md:ml-36 ml-5">
            <div className="font-bold">Our Services</div>
            <div
              className={`${robotoFontBodyLight.className} text-white md:text-[15px] text-[10px] mt-5`}
            >
              Solar Installations
            </div>
            <div
              className={`${robotoFontBodyLight.className} text-white md:text-[15px] text-[10px] mt-5`}
            >
              Design Consultation
            </div>
            <div
              className={`${robotoFontBodyLight.className} text-white md:text-[15px] text-[10px] mt-5`}
            >
              CCTV Installation
            </div>
            <div
              className={`${robotoFontBodyLight.className} text-white md:text-[15px] text-[10px] mt-5`}
            >
              3D Printing
            </div>
          </div>

          <div className="md:ml-36 ml-5">
            <div className="font-bold">Company</div>
            <div
              className={`${robotoFontBodyLight.className} text-white md:text-[15px] text-[10px] mt-5`}
            >
              About Us
            </div>
            <div
              className={`${robotoFontBodyLight.className} text-white md:text-[15px] text-[10px] mt-5`}
            >
              Contact Us
            </div>
            <div
              className={`${robotoFontBodyLight.className} text-white md:text-[15px] text-[10px] mt-5`}
            >
              Latest News
            </div>
            <div
              className={`${robotoFontBodyLight.className} text-white md:text-[15px] text-[10px] mt-5`}
            >
              Live Chat
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default AboutPage;
