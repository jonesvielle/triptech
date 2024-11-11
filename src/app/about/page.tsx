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
        <div className="landing flex flex-col w-full md:pt-60 pt-40 md:px-60 px-5">
          <div className="color-overlay"></div>
          <div
            className={`text-center ${robotoFont.className} md:text-[55px] text-[25px]`}
          >
            Tri-P Innovative Tech was born out of a vision to make life more
            enjoyable, secure and productive.
          </div>
          <div
            className={`text-center text-20 mt-10 md:text-[20px] text-[12px] ${robotoFontBodyLight.className}`}
          >
            <SlideUpComponent>
              Empowering Africa: Reliable Power, Enhanced Security, Thoughtful
              Design for Every Home. Transforming lives with cutting-edge
              solutions tailored to your community&apos;s needs.
            </SlideUpComponent>
          </div>
          <div className="text-white-500 flex md:flex-row flex-col md:mt-16 mt-16 flex flex-row justify-center">
            <button
              // onClick={handleScrollToServiceSection}
              className="border border-w-4 border-white px-4 py-3 rounded-full bg-white text-custom-blue"
            >
              Contact Our Team
            </button>
            <button
              // onClick={handleScrollToQuotationSection}
              className="md:ml-4 px-4 mt-5 md:mt-0 py-3 border border-w-4 border-custom-blue bg-custom-blue rounded-full"
            >
              Get a Quotation
            </button>
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
            Unwaivering Dedication To Powering & Securing
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
                The inception of TRI-P is rooted in the collaborative vision of
                three pioneering minds in Lagos, Nigeria. United by a shared
                passion for technology and sustainability, they embarked on a
                mission to revolutionize energy harnessing, home protection, and
                custom product creation.
              </SlideUpComponent>
            </div>
            <div
              className={`${robotoFontBodyLight.className} md:text-[23px] text-[15px] md:text-start text-center mt-5`}
            >
              <SlideUpComponent>
                Acknowledging the escalating demand for reliable alternative
                power solutions, advanced security systems, and the rapidly
                evolving field of 3D printing, TRI-P was established. Our
                founders were driven by the ambition to provide high-quality,
                accessible, and innovative solutions tailored to meet the
                diverse needs of our community and beyond.
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
            We Power, Secure & Create 3D Solutions For Households & Offices
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
                  For Homes & Office Needs
                </div>
                <div
                  className={`${robotoFontBody.className} md:text-[23px] text-[15px] md:text-start text-center text-secondary-gray`}
                >
                  <SlideUpComponent>
                    At TRI-P, we are committed to delivering superior solutions
                    across three primary domains: alternative power, security,
                    and custom products.
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
                    Our team of experts is dedicated to continuous learning and
                    adaptation, staying at the forefront of industry trends to
                    deliver the most innovative and effective solutions
                    available with the highest quality
                  </SlideUpComponent>
                </div>
                <button
                  // onClick={handleScrollToQuotationSection}
                  className="md:ml-0 px-4 mt-5 md:mt-5 py-3 border border-w-4 border-custom-blue bg-custom-blue rounded-full md:mb-0 mb-10"
                >
                  Explore Solar Services
                </button>
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
                    At TRI-P, we are committed to delivering top-tier solutions
                    across three core areas: alternative power, security, and
                    custom products
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
                <button
                  // onClick={handleScrollToQuotationSection}
                  className="md:ml-0 px-4 mt-5 md:mt-5 py-3 border border-w-4 border-custom-blue bg-custom-blue rounded-full md:mb-0 mb-10"
                >
                  Explore Solar Services
                </button>
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
                    At TRI-P, we are dedicated to providing high-quality
                    solutions across three primary domains: alternative power,
                    security, and custom products.
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
                    Our team of experts stays ahead of industry trends,
                    continuously refining our approach to ensure we offer the
                    most innovative, effective, and high-quality security
                    solutions available.
                  </SlideUpComponent>
                </div>
                <button
                  // onClick={handleScrollToQuotationSection}
                  className="md:ml-0 px-4 mt-5 md:mt-5 py-3 border border-w-4 border-custom-blue bg-custom-blue rounded-full md:mb-0 mb-10"
                >
                  Explore Solar Services
                </button>
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
              Our Manifesto & Modus Operandi
            </div>
            <div className="md:w-1/2 w-full md:ml-16 mt-5">
              <div
                className={`${robotoFontBody.className} md:text-[23px] text-[15px] md:text-start text-center text-white`}
              >
                <SlideUpComponent>
                  We endorse a thoughtful approach to technology that
                  prioritizes both functionality and aesthetics. We invite you
                  to join our journey toward an innovative future.
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
                      We conduct our business with the highest level of
                      integrity, providing transparent pricing and honest
                      recommendations
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
                      We prioritize our customers&apos; needs and satisfaction,
                      ensuring personalized service and support at every step.
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
                      We prioritize our customers&apos; needs and satisfaction,
                      ensuring personalized service and support at every step
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
              We&apos;ve so far worked with over 700 satisfied clients and are
              still growing with 45 employees nationwide.
            </SlideUpComponent>
          </div>
          {/* alternative power solutions */}
          <div className="flex justify-center items-center w-full bg-blue-00">
            {/* text part */}
            <div className="md:w-1/2 md:pl-28 pl-0 flex flex-col   bg-red-00">
              <div
                className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark mt-5 mb-0 md:text-[40px] text-[20px] bg-red-0`}
              >
                Altrernative Power Solutions
              </div>
              <div
                className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-green mt-0 mb-5 md:text-[40px] text-[20px]`}
              >
                For Homes & Office Needs
              </div>
              <div
                className={` mt-0 md:text-[18px] text-[12px] md:text-start text-center ${robotoFontBody.className} text-secondary-gray md:w-2/3 px-5 md:px-0`}
              >
                <SlideUpComponent>
                  Harness the power of the sun with TRI-P TECH&apos;s
                  cutting-edge power solutions. Our solar panels maximize energy
                  production, providing a sustainable and cost-effective
                  alternative to traditional power sources.
                </SlideUpComponent>
              </div>
              <div className="flex mt-5 md:justify-start justify-center">
                <div className="text-[30px] font-bold text-primary-green md:w-[120px] w-[110px]">
                  <CountUp target={40} addedString="K+" />
                </div>
                <div
                  className={` mt-0 text-20  md:text-[18px] text-[12px] ${robotoFontBody.className} text-secondary-gray w-1/2`}
                >
                  <b className="font-black text-black">
                    Solar Panels Installed
                  </b>{" "}
                  in over 700 homes and offices across Nigeria.
                </div>
              </div>
              <div className="flex mt-5 md:justify-start justify-center">
                <div className="text-[30px] font-bold text-primary-green md:w-[120px] w-[110px]">
                  <CountUp target={300} addedString="K+" />
                </div>
                <div
                  className={` mt-0 text-20 md:text-[18px] text-[12px] ${robotoFontBody.className} text-secondary-gray w-1/2`}
                >
                  <b className="font-black text-black">
                    Solar Panels Installed
                  </b>{" "}
                  in over 700 homes and offices across Nigeria.
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
          <div className="flex justify-center items-center w-full bg-red-0 mt-10">
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
                  Bring your ideas to life with TRI-P TECH&apos;s 3D printing
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
              {/* <div className="flex mt-5">
              <div className="text-[30px] font-bold text-primary-green  w-[120px]">
                3k+
              </div>
              <div
                className={` mt-0 text-20 text-[18px] ${robotoFontBody.className} text-secondary-gray w-1/2`}
              >
                <b className="font-black text-black">CCTV Camera's Installed</b>{" "}
                in over 700 offices across Nigeria.
              </div>
            </div> */}
            </div>
          </div>
          {/* Securing andd monitoring */}
          <div className="flex justify-center items-center w-full bg-red-0 mt-10">
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
                Safegaurding Africans
              </div>
              <div
                className={` mt-0 text-[12px] md:text-[18px] text-center md:text-start ${robotoFontBody.className} text-secondary-gray md:w-2/3 md:px-0 px-5`}
              >
                <SlideUpComponent>
                  Ensure the safety and security of your property with TRI-P
                  TECH&apos;s CCTV installation services. We offer a range of
                  surveillance solutions tailored to meet your specific needs,
                  whether for residential, commercial, or industrial use.
                </SlideUpComponent>
              </div>

              <div className="flex mt-5 md:justify-start justify-center">
                <div className="text-[30px] font-bold text-primary-green  w-[70px]">
                  <CountUp target={7} addedString="K+" />
                </div>
                <div
                  className={` mt-0 text-[12px] md:text-[18px] ${robotoFontBody.className} text-secondary-gray w-1/2`}
                >
                  <b className="font-black text-black">
                    CCTV Cameras Installed
                  </b>{" "}
                  in over 120 homes and offices across Nigeria.
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
