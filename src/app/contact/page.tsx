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
  const companyPhone = process.env.NEXT_PUBLIC_COMPANY_PHONE || "2348144952854";
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [contactFeedback, setContactFeedback] = useState("");

  const handleContactChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setContactForm((current) => ({ ...current, [name]: value }));
    if (contactStatus !== "idle") {
      setContactStatus("idle");
      setContactFeedback("");
    }
  };

  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const clientName = `${contactForm.firstName} ${contactForm.lastName}`.trim();
    const email = contactForm.email.trim();
    const phone = contactForm.phone.trim();
    const message = contactForm.message.trim();

    if (!clientName || !email || !phone || !message) {
      setContactStatus("error");
      setContactFeedback("Please fill in your name, email, phone number, and message.");
      return;
    }

    setContactStatus("sending");
    setContactFeedback("");

    try {
      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          email,
          phone,
          location: "Contact page",
          site_note: message,
          total_cost: 0,
          daily_energy_wh: 0,
          system_voltage: 0,
          quote: {
            requestType: "contact",
            source: "contact-page",
            firstName: contactForm.firstName.trim(),
            lastName: contactForm.lastName.trim(),
            message,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Contact request failed.");
      }

      setContactStatus("success");
      setContactFeedback("Message received. TRI-P Tech will follow up shortly.");
      setContactForm({ firstName: "", lastName: "", email: "", phone: "", message: "" });
    } catch (error) {
      setContactStatus("error");
      setContactFeedback("Could not send your message. Please try again or use WhatsApp.");
    }
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
              Thank you for your interest in TRI-P Tech Limited. Tell us what
              you need, and our team will respond with the right next step.
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
            <form onSubmit={handleContactSubmit}>
              <div className="flex md:flex-row flex-col w-full justify-between items-center">
                <div className="flex flex-col w-full">
                  <InputComponent
                    required
                    placeholder="e.g Jones"
                    label="First name"
                    name="firstName"
                    value={contactForm.firstName}
                    onChange={handleContactChange}
                  />
                </div>
                <div className="flex flex-col w-full md:ml-5 ml-0 mt-3 md:mt-0">
                  <InputComponent
                    required
                    placeholder="e.g Nathan"
                    label="Last name"
                    name="lastName"
                    value={contactForm.lastName}
                    onChange={handleContactChange}
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
                    value={contactForm.email}
                    onChange={handleContactChange}
                  />
                </div>
                <div className="flex flex-col w-full md:ml-5 ml-0 mt-3 md:mt-0">
                  <InputComponent
                    required
                    placeholder="Enter phone"
                    label="Phone number"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactChange}
                  />
                </div>
              </div>
              <div className="flex flex-row w-full justify-between items-center mt-5">
                <div className="flex flex-col w-full">
                  <AreaInputComponent
                    required
                    type="text"
                    placeholder="Tell us what you need help with. Include the project type, location, and any important details."
                    label="Message to our team"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  disabled={contactStatus === "sending"}
                  type="submit"
                  className={`mt-10 flex min-h-[54px] items-center justify-center rounded-full bg-custom-blue px-6 py-4 text-center font-semibold text-white transition md:w-1/3 w-full ${
                    contactStatus === "sending" ? "cursor-wait opacity-80" : "hover:shadow-lg"
                  }`}
                >
                  {contactStatus === "sending"
                    ? "Sending..."
                    : contactStatus === "success"
                    ? "Message received"
                    : "Get in touch"}
                </button>
              </div>
              {contactFeedback ? (
                <p
                  className={`mt-4 text-center text-sm font-semibold ${
                    contactStatus === "error" ? "text-red-600" : "text-[#117865]"
                  }`}
                >
                  {contactFeedback}
                </p>
              ) : null}
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
                  href={`https://wa.me/${companyPhone}`}
                  className="text-custom-blue"
                >
                  {companyPhone}
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
                  href={`mailto:${process.env.NEXT_PUBLIC_SUPPORTEMAILADDRESS}`}
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
                  href={`tel:${companyPhone}`}
                  className="text-custom-blue"
                >
                  {companyPhone}
                </a>
                <div className="text-light-gray">
                  Mon-Sun, 8:00 AM - 9:00 PM
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
                  Office and service location
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
      
    </>
  );
};

export default AboutPage;


