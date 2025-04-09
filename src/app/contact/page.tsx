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
  IoCalendar,
  IoCall,
  IoCheckbox,
  IoEarthSharp,
  IoExitOutline,
  IoGlobeSharp,
  IoLocationSharp,
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoWhatsapp,
  IoMail,
  IoOpenOutline,
  IoPersonSharp,
  IoPhonePortrait,
  IoPin,
  IoPinSharp,
  IoShareSocialOutline,
  IoWifiSharp,
} from "react-icons/io5";
import BounceInComponent from "../components/BounceInComponent";
import SlideUpComponent from "../components/SlideUpComponent";
import CountUp from "../components/CountUpAnimation";
import InputComponent from "../components/InputComponent";
import AreaInputComponent from "../components/AreaInputComponent";
import Link from "next/link";

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
      <main className="z-0">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          progressStyle={{ backgroundColor: "#117865" }}
        />
        {/* hero */}
        <div className="landing-contact flex flex-col w-full md:pt-32 md:pt-20 pt-32 pb-16 md:px-60 px-5">
          <div className="color-overlay"></div>
          <div
            className={`text-center ${robotoFont.className} md:text-[55px] text-[25px]`}
          >
            Contact
          </div>
          <div
            className={`text-center text-20 mt-5 md:text-[20px] text-[12px] ${robotoFontBody.className} md:mb-24 mb-36`}
          >
            <SlideUpComponent>
              Thank you for your interest in Tri-P Innovative Tech. Send us a
              message and our team of experts wiill get in touch with you to
              discuss your projects or ideas.
            </SlideUpComponent>
          </div>
        </div>
        {/* form */}
        <div className="bg-white relative md:p-32 p-8">
          {/* form-div */}
          <div
            className="border-2 rounded-lg md:p-20 p-5 absolutes z-10 bg-white"
            style={{
              marginTop: -200,
              top: 0,
              // left: "50%",
              // transform: "translateX(-50%)",
            }}
          >
            <form>
              <div className="flex md:flex-row flex-col w-full justify-between items-center">
                <div className="flex flex-col w-full">
                  <InputComponent
                    required
                    placeholder="e.g Jones"
                    label="First Name"
                    name="fullName"
                  />
                </div>
                <div className="flex flex-col w-full md:ml-5 ml-0 mt-3 md:mt-0">
                  <InputComponent
                    required
                    placeholder="e.g Nathan"
                    label="Last Name"
                    name="lastName"
                  />
                </div>
              </div>
              <div className="flex md:flex-row flex-col w-full justify-between items-center mt-5">
                <div className="flex flex-col w-full">
                  <InputComponent
                    required
                    type="email"
                    placeholder="Enter email address"
                    label="Email address"
                    name="email"
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
              <div className="flex flex-row w-full justify-between items-center mt-5">
                <div className="flex flex-col w-full">
                  <AreaInputComponent
                    required
                    type="text"
                    placeholder="Please describe why exactly you want to reach us so we can respond to your query with enough details. This section is important; do not regard it as optional."
                    label="Message to Our Team"
                    name="appointmentDetails"
                  />
                </div>
              </div>

              <div className="flex flex-row justify-center mt-5">
                <IoCheckbox color={"#117865"} className="mt-1" size={22} />
                <div className="ml-2 text-primary-dark">
                  Subscribe to Tri-P Tech's Newsletter to receive Personalized
                  News, Customised Installation Quotes, Free Materials and Press
                  Releases to your email at zero cost.
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  // disabled={mailLoading}
                  type="submit"
                  className="bg-custom-blue mt-10 text-center py-4 rounded-full md:w-1/3 w-full"
                >
                  {/* D545A49D */}
                  {/* {mailLoading ? "Please wait..." : " Submit Request"} */}
                  Get in touch
                </button>
              </div>
            </form>
          </div>
          {/* contacts */}
          <div className="mt-20 flex flex-col md:flex-row justify-between">
            <div className="flex flex-row items-center">
              <div className="bg-very-light-gray rounded-full flex items-center justify-center p-3">
                <IoLogoWhatsapp className="text-custom-blue" />
              </div>
              <div className="ml-3">
                <div className="font-bold text-primary-dark">WhatsApp</div>
                <div className="text-light-gray">Click the link to chat</div>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_COMPANY_PHONE}`}
                  className="text-custom-blue"
                >
                  {process.env.NEXT_PUBLIC_COMPANY_PHONE}
                </a>
              </div>
              <IoOpenOutline className="text-custom-blue self-end ml-3 mb-1" />
            </div>
            <div className="flex flex-row items-center mt-5 md:mt-0">
              <div className="bg-very-light-gray rounded-full flex items-center justify-center p-3">
                <IoMail className="text-custom-blue" />
              </div>
              <div className="ml-3">
                <div className="font-bold text-primary-dark">Email</div>
                <div className="text-light-gray">Send us an email:</div>
                <a
                  href="https://wa.me/2349087478324"
                  className="text-custom-blue"
                >
                  {process.env.NEXT_PUBLIC_SUPPORTEMAILADDRESS}
                </a>
              </div>
              <IoOpenOutline className="text-custom-blue self-end ml-3 mb-1" />
            </div>
            <div className="flex flex-row items-center  mt-5 md:mt-0">
              <div className="bg-very-light-gray rounded-full flex items-center justify-center p-3">
                <IoCall className="text-custom-blue" />
              </div>
              <div className="ml-3">
                <div className="font-bold text-primary-dark">Call</div>
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE}`}
                  className="text-custom-blue"
                >
                  {process.env.NEXT_PUBLIC_COMPANY_PHONE}
                </a>
                <div className="text-light-gray">
                  Mon - Sun : 8:00 am to 9:00 pm
                </div>
              </div>
              {/* <IoOpenOutline className="text-custom-blue self-end ml-3 mb-1" /> */}
            </div>
            <div className="flex flex-row items-center  mt-5 md:mt-0">
              <div className="bg-very-light-gray rounded-full flex items-center justify-center p-3">
                <IoLocationSharp className="text-custom-blue" />
              </div>
              <div className="ml-3">
                <div className="font-bold text-primary-dark">Address</div>
                <div className="text-light-gray">
                  Mon - Sat : 8:00 am to 9:00 pm
                </div>
                <div className="text-secondary-gray">
                  {process.env.NEXT_PUBLIC_COMPANY_ADDRESS}
                </div>
              </div>
              {/* <IoOpenOutline className="text-custom-blue self-end ml-3 mb-1" /> */}
            </div>
          </div>
          {/* hgfghgfdhghdghgf */}
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
