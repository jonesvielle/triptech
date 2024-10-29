/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

"use client";
import { FormEvent, useRef, useState } from "react";
import "react-toastify/dist/ReactToastify.css"; // Import styles
import "../../styles/global.css";
import { ToastContainer, toast } from "react-toastify";
import {
  robotoFont,
  robotoFontBody,
  robotoFontBodyLight,
} from "./helpers/fonts";
import Image from "next/image";
import {
  IoCalendar,
  IoCall,
  IoCallSharp,
  IoCashSharp,
  IoGridSharp,
  IoLocation,
  IoLockClosedSharp,
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoWhatsapp,
  IoMailOpen,
  IoSnowSharp,
} from "react-icons/io5";
import CheckList from "./components/CheckList";
import { servicesList } from "./helpers/lists";
import InputComponent from "./components/InputComponent";
import AreaInputComponent from "./components/AreaInputComponent";
import SelectInputComponent from "./components/SelectInputComponent";
import SlideUpComponent from "./components/SlideUpComponent";
import BounceInComponent from "./components/BounceInComponent";
import CountUp from "./components/CountUpAnimation";
import {
  BookAppointmentRequestPayloadType,
  QuotationRequestPayloadType,
} from "./types";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

// Define an interface for the form data
export default function Home() {
  const quotationSectionRef = useRef<HTMLDivElement>(null);
  const serviceSectionRef = useRef<HTMLDivElement>(null);

  const [mailLoading, setMailLoading] = useState(false);

  const handleScrollToQuotationSection = () => {
    quotationSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToServiceSection = () => {
    serviceSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  console.log("process.env.EMAIL_USER,", process?.env?.EMAIL_USER);

  const handleSubmitMailBook = async (
    payload: BookAppointmentRequestPayloadType
  ) => {
    // return;
    const { fullName, appointmentDate, appointmentDetails, phone, email } =
      payload;
    // return;
    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: process.env.NEXT_PUBLIC_SUPPORTEMAILADDRESS,
          subject: `APPOINTMENT BOOKING WITH ${payload.fullName.toUpperCase()}`,
          text: `
          <html>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); padding: 20px;">
      <h2 style="text-align: center; color: #333;">Appointment Details</h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f7f7f7;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; text-align: left; width: 40%;">Full Names</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">${fullName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: #f7f7f7;">Email</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
        </tr>
        <tr style="background-color: #f7f7f7;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Phone</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: #f7f7f7;">Appointment Details</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${appointmentDetails}</td>
        </tr>
        <tr style="background-color: #f7f7f7;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Appointment Date</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${appointmentDate}</td>
        </tr>
      </table>

      <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
        Thank you for booking your appointment with us.
      </p>
    </div>
  </body>
</html>

          `,
        }),
      });

      const responseData = await response.json();
      console.log("response: ", responseData);
      setMailLoading(false);

      if (response.ok) {
        toast.success("Appoitment was sent successfully", { autoClose: 5000 });

        console.log("successfully sent");
      } else {
        toast.error(responseData.message, { autoClose: 5000 });
      }
    } catch (error) {
      setMailLoading(false);
      toast.error("Something went wrong", { autoClose: 5000 });
      alert("Error sending email: " + error);
      console.error("Error:", error);
    }
  };

  const handleSubmitMailQuote = async (
    payload: QuotationRequestPayloadType
  ) => {
    // return;
    const {
      fullName,
      appointmentDate,
      fullDescription,
      phone,
      email,
      serviceRequired,
    } = payload;
    // return;
    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: process.env.NEXT_PUBLIC_SUPPORTEMAILADDRESS,
          subject: `QUOTE REQUEST FROM ${payload.fullName.toUpperCase()}`,
          text: `
          <html>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); padding: 20px;">
      <h2 style="text-align: center; color: #333;">Appointment Details</h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f7f7f7;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; text-align: left; width: 40%;">Full Names</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: left;">${fullName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: #f7f7f7;">Email</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
        </tr>
        <tr style="background-color: #f7f7f7;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Phone</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: #f7f7f7;">Service Required</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${serviceRequired}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: #f7f7f7;">Full Description</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${fullDescription}</td>
        </tr>
        <tr style="background-color: #f7f7f7;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Appointment Date</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${appointmentDate}</td>
        </tr>
      </table>

      <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
          Thee quotation request is received.
      </p>
    </div>
  </body>
</html>

          `,
        }),
      });

      const responseData = await response.json();
      setMailLoading(false);
      console.log("response: ", responseData);

      if (response.ok) {
        toast.success("Quotation was sent successfully", { autoClose: 5000 });

        console.log("successfully sent");
      } else {
        toast.error(responseData.message, { autoClose: 5000 });
      }
    } catch (error) {
      setMailLoading(false);
      toast.error("Something went wrong", { autoClose: 5000 });
      alert("Error sending email: " + error);
      console.error("Error:", error);
    }
  };

  const handleSubmitBook = (event: FormEvent<HTMLFormElement>) => {
    setMailLoading(true);
    event.preventDefault();
    console.log("handleSubmitBook fired");

    // Create a new FormData object
    const formData = new FormData(event?.target);
    // console.log("formData: " + JSON.stringify(formData))
    let payload = {};
    // Optional: Log form data for debugging
    for (const [key, value] of formData?.entries()) {
      // console.log("loger", key, value);
      payload = { ...payload, [key]: value };
    }
    console.log("payload", payload);
    if (payload) {
      handleSubmitMailBook(payload);
    }
  };

  const handleSubmitQuote = (event: FormEvent<HTMLFormElement>) => {
    setMailLoading(true);
    event.preventDefault();

    console.log("handleSubmitQuote fired");

    // Create a new FormData object
    const formData = new FormData(event?.target);
    // console.log("formData: " + JSON.stringify(formData))
    let payload = {};
    // Optional: Log form data for debugging
    for (const [key, value] of formData?.entries()) {
      // console.log("loger", key, value);
      payload = { ...payload, [key]: value };
    }
    console.log("payload quote", payload);
    // return;
    if (payload) {
      handleSubmitMailQuote(payload);
    }
  };

  return (
    <>
      <div className="">
        <main>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            progressStyle={{ backgroundColor: "#117865" }}
          />
          {/* hero */}
          <div className="hero  flex flex-col w-full pb-16">
            {/* <div className="hero-background-overlay" /> */}
            <video autoPlay loop muted playsInline className="background-video">
              {/* <div className="hero-background-overlay" /> */}
              <source src="/images/hero-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="color-overlay"></div>

            <div className="flex z-10 flex-row items-center justify-center w-full md:mt-52 mt-36  mb-5 px-0 md:px-20">
              <div className="md:w-3/4 w-5/6">
                {/* carousel */}
                <div className="max-w-screen-lg mx-auto">
                  <Carousel
                    showArrows={false}
                    showStatus={false}
                    showIndicators={true}
                    infiniteLoop
                    autoPlay
                    interval={5000} // Adjust timing as needed
                    stopOnHover
                    emulateTouch
                    preventMovementUntilSwipeScrollTolerance={true}
                    swipeScrollTolerance={50}
                    className="text-center"
                  >
                    {/* Slide 1 */}
                    <div className="md:mb-20 mb-32">
                      <div
                        className={`${robotoFont.className} text-[30px] md:text-[60px] font-bold`}
                      >
                        Empowering a sustainable future for Africa with
                        alternative power solutions
                      </div>
                      <div className="mt-10 text-[20px] font-euclidLight text-center">
                        <SlideUpComponent>
                          Explore our custom solar system, CCTV, and 3D printing
                          services, as well as consultancy and product design
                          expertise.
                        </SlideUpComponent>
                      </div>
                    </div>

                    {/* Slide 2 */}
                    <div className="md:mb-20 mb-32">
                      <div
                        className={`${robotoFont.className} text-[30px] md:text-[60px] font-bold`}
                      >
                        Empowering a sustainable future for Africa with
                        alternative power solutions
                      </div>
                      <div className="mt-10 text-[20px] font-euclidLight text-center">
                        <SlideUpComponent>
                          Explore our custom solar system, CCTV and 3d printing
                          services As well as other consultancy and product
                          design related expetise recommendations
                        </SlideUpComponent>
                      </div>
                    </div>

                    {/* Slide 3 */}
                    <div className="md:mb-20 mb-20">
                      <div
                        className={`${robotoFont.className} text-[30px] md:text-[60px] font-bold`}
                      >
                        Secure Your World with Our Advanced CCTV Solutions
                      </div>
                      <div className="mt-10 text-[20px] font-euclidLight text-center">
                        <SlideUpComponent>
                          Safeguard what matters most with Tri-P Tech’s custom
                          CCTV solutions, offering peace of mind for home or
                          business through reliable, comprehensive coverage.
                        </SlideUpComponent>
                      </div>
                    </div>
                  </Carousel>
                </div>

                <div className="text-white-500 flex md:flex-row flex-col md:mt-16 mt-8 flex flex-row justify-center">
                  <button
                    onClick={handleScrollToServiceSection}
                    className="border border-w-4 border-white px-4 py-3 rounded-full bg-white text-custom-blue"
                  >
                    Explore Our Services
                  </button>
                  <button
                    onClick={handleScrollToQuotationSection}
                    className="md:ml-4 px-4 mt-5 md:mt-0 py-3 border border-w-4 border-custom-blue bg-custom-blue rounded-full"
                  >
                    Get a Quote
                  </button>
                </div>
              </div>
            </div>
            {/* <div className="px-20 z-10 md:mt-10 mt-12 md:mb-10 mb-3 md:flex md:flex-row hidden flex-col items-center self-center">
              <Image
                // layout="responsive"
                height={10}
                width={20}
                alt="Logo"
                src={"/images/star.png"}
                priority
              />
              <div className="font-bold ml-1">Certifications</div>
              <div className="ml-3 font-thin">ISO 9012:2024|</div>
              <div className="ml-2 font-thin">A36001E</div>
              <div className="ml-2 font-thin">ITAR Registered</div>
            </div> */}
          </div>
          {/* about */}
          <div className="bg-white md:px-20 py-16 flex flex-col items-center">
            <div className="text-primary-green border-2 rounded-xxl py-2 px-4">
              TRIP INNOVATIVE TECH
            </div>
            <div
              className={`${robotoFont.className} font-bold md:text-start text-center text-primary-dark mt-5 mb-10 md:text-[40px] text-[20px]`}
            >
              Powering & Securing Nigeria Since 2021
            </div>
            <div className="flex flex-row  justify-center">
              <div className={`md:w-2/5 w-4/5 text-black`}>
                <p
                  className={`${robotoFontBody.className} md:text-[23px] text-[18px]`}
                >
                  TRI-P Innovative Solutions is an indigenous Solar energy,
                  security systems and product modelling company based in
                  Nigeria.
                </p>
                <div
                  className={`${robotoFontBody.className} md:text-[23px] text-[18px] mt-5`}
                >
                  Since 2021, we have been Africa&apos;s trusted partner for
                  solar energy, cctv installation and 3d modelling and printing,
                  design consultation. We currently have over 45 staff stationed
                  strategically across the nation.
                </div>
                <div>
                  <CheckList
                    data={servicesList}
                    itemContainerStyle={{ marginTop: "2%" }}
                  />
                </div>
              </div>
              {/* <BounceInComponent> */}
              <div className="w-1/5 h-[500px] relative ml-5 md:block hidden">
                <Image
                  className="rounded-lg"
                  layout="fill"
                  objectFit="cover"
                  alt="About Us"
                  src={"/images/secure-cam.jpg"}
                  priority
                  style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                />
                <div className="p-5 flex flex-row items-center rounded-tl-xxl flex-row  w-4/5 bg-primary-green right-0 z-20 bottom-0 absolute">
                  <IoLockClosedSharp color="white" fontSize={20} />
                  <div className="text-white ml-3">
                    <div>4000+ CCTV</div>
                    <div>Systems installed</div>
                  </div>
                </div>
              </div>
              {/* </BounceInComponent> */}
              <div className="w-1/5 relative ml-5 flex flex-col  md:block hidden">
                <BounceInComponent>
                  <div className="h-[240px] relative">
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
                <BounceInComponent>
                  <div className="h-[240px] relative mt-5">
                    <Image
                      className="rounded-lg"
                      layout="fill"
                      objectFit="cover"
                      alt="About Us"
                      src={"/images/printer.jpg"}
                      priority
                      style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                    />
                  </div>
                </BounceInComponent>
              </div>
            </div>
          </div>
          {/* numbers */}
          <div className="bg-dark-green px-40 py-10 flex md:flex-row flex-col items-center justify-between">
            <div>
              <div className="font-bold text-[70px]">
                <CountUp duration={5000} target={260} addedString="+" />
              </div>
              <div>Projects Completed</div>
            </div>
            <div>
              <div className="font-bold text-[70px] mt-5 md:mt-0">
                <CountUp duration={5000} target={98} addedString="%" />
              </div>
              <div>Satisfaction Rate</div>
            </div>
            <div>
              <div className="font-bold text-[70px] mt-5 md:mt-0">
                <CountUp duration={5000} target={200} addedString="+" />
              </div>
              <div>Satistied Clients</div>
            </div>
            <div>
              <div className="font-bold text-[70px] mt-5 md:mt-0">
                <CountUp duration={5000} target={100} addedString="+" />
              </div>
              <div>Qualified Staffs</div>
            </div>
          </div>
          {/* our services */}
          <div
            ref={serviceSectionRef}
            className="bg-white md:px-40 px-4 py-16 flex flex-col md:items-start items-center"
          >
            <div
              className={`text-primary-green border-2 rounded-xxl py-2 px-4`}
            >
              OUR SERVICES
            </div>
            <div
              className={`${robotoFont.className} font-bold text-center md:text-start text-primary-dark mt-5 md:text-[40px] text-[20px] font-[700px]`}
            >
              We Push Beyond the Industry Standards &
            </div>
            <div
              className={`${robotoFont.className} font-bold text-center md:text-start text-primary-green md:text-[40px] text-[20px] font-[700px]`}
            >
              Benchmarks for Service Delivery
            </div>
            <div
              className={`${robotoFontBodyLight.className} text-black ml-2 md:text-[20px] text-[15px] mt-5 text-center md:text-start`}
            >
              <SlideUpComponent>
                At Tri-P Innovative Tech, we offer a comprehensive suite of
                manufacturing, security, design and electrification services,
                meticulously tailored to match your unique project requirements,
                ensuring success at every step.
              </SlideUpComponent>
            </div>
            <div className="flex md:flex-row flex-col  mt-10 md:justify-start items-center md:items-start w-full">
              <BounceInComponent>
                <div className="h-[400px] w-[300px] relative md:mr-5 mr-0">
                  <Image
                    className="rounded-xxl"
                    layout="fill"
                    objectFit="cover"
                    alt="About Us"
                    src={"/images/solar-array.jpg"}
                    priority
                    style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-50 rounded-xxl opacity-100">
                    <div className="absolute text-white z-[150] bottom-0 mb-12 px-5 opacity-100">
                      <div className="font-bold">
                        Customer Solar Installation
                      </div>
                      <div className="mt-1 text-[15px] ] z-[150]">
                        The Sun is our witness. We harness the power of the Sun
                        at Tri-P Tech with our cutting edge Solar Panels.
                      </div>
                      <div className="flex flex-row mt-4">
                        <button
                          // onClick={pause}
                          className="border border-white px-4 py-2 rounded-full mt-5 bg-white text-custom-blue text-[15px] z-[150]"
                        >
                          Learn more
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </BounceInComponent>

              <BounceInComponent>
                <div className="h-[400px] w-[300px] relative md:mt-0 mt-10">
                  <Image
                    className="rounded-xxl"
                    layout="fill"
                    objectFit="cover"
                    alt="About Us"
                    src={"/images/cctv.jpg"}
                    priority
                    style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-gray-400 to-black z-50 rounded-xxl opacity-100">
                    <div className="absolute text-white z-[150] bottom-0 mb-12 px-5 opacity-100">
                      <div className="font-bold">Custom CCTV Installation</div>
                      <div className="mt-1 text-[15px] ] z-[150]">
                        Our CCTV systems provide peace of mind for you, your
                        business, property, staff and clients.
                      </div>
                      <div className="flex flex-row mt-4">
                        <button
                          // onClick={pause}
                          className="border border-white px-4 py-2 rounded-full mt-5 bg-white text-custom-blue text-[15px] z-[150]"
                        >
                          Learn more
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </BounceInComponent>

              <BounceInComponent>
                <div className="h-[400px] w-[300px] relative md:ml-5 ml-0 md:mt-0 mt-10">
                  <Image
                    className="rounded-xxl"
                    layout="fill"
                    objectFit="cover"
                    alt="About Us"
                    src={"/images/print-car.jpg"}
                    priority
                    style={{ zIndex: 1 }} // Ensures the image is behind the overlay div
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-50 rounded-xxl opacity-100">
                    <div className="absolute text-white z-[150] bottom-0 mb-12 px-5 opacity-100">
                      <div className="font-bold">3D Printing & Machining</div>
                      <div className="mt-1 text-[15px] ] z-[150]">
                        Our advanced 3d printers bring your deisgns to life with
                        precision and efficiency.
                      </div>
                      <div className="flex flex-row mt-4">
                        <button
                          // onClick={pause}
                          className="border border-white px-4 py-2 rounded-full mt-5 bg-white text-custom-blue text-[15px] z-[150]"
                        >
                          Learn more
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </BounceInComponent>
            </div>
          </div>
          {/* Book appointment */}
          <div>
            {/* <ParallaxComponent backgroundImage="/images/home-solar.webp" /> */}
            <div className="flex md:flex-row flex-col book-appointment md:px-40 py-24 flex flex-row md:items-start items-center justify-between">
              <div className="md:w-1/3 w-4/5">
                <div className="flex md:justify-start justify-center">
                  <div
                    // onClick={pause}
                    className="border border-w-4  border-white px-4 py-3 rounded-full bg-white text-primary-dark"
                  >
                    BOOK APPOINTMENT
                  </div>
                </div>
                <div
                  className={`${robotoFont.className} text-white my-5 md:text-[40px] text-[20px] md:text-start text-center`}
                >
                  Schedule a Consultation With one of Our Experts
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-white ml-2 md:text-[20px] text-[15px] mt-5  md:text-start text-center`}
                >
                  <SlideUpComponent>
                    We do in-person or video consultations on product design and
                    TRI-P Innovative Solutions on indigenous Solar energy,
                    security systems and product modelling company based in
                    Nigeria.
                  </SlideUpComponent>
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-white ml-2 md:text-[20px] text-[15px] mt-5  md:text-start text-center`}
                >
                  <SlideUpComponent>
                    We do in-person or video consultations on product design and
                    , TRI-P Innovative Solutions is an indigenous Solar energy,
                    security systems and product modelling company based in
                    Nigeria.
                  </SlideUpComponent>
                </div>
              </div>
              <div className="md:w-2/3 w-5/6 p-10 bg-white rounded-xl md:mt-0 mt-10">
                <form onSubmit={handleSubmitBook}>
                  <div className="flex md:flex-row flex-col w-full justify-between items-center">
                    <div className="flex flex-col w-full">
                      <InputComponent
                        required
                        placeholder="e.g Jones Obenobe"
                        label="Full name"
                        name="fullName"
                      />
                    </div>
                    <div className="flex flex-col w-full  md:ml-5 ml-0 mt-3 md:mt-0">
                      <InputComponent
                        required
                        placeholder="Enter phone"
                        label="Phone number"
                        name="phone"
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
                        type="date"
                        Icon={
                          <IoCalendar className="text-[30px] text-primary-gray" />
                        }
                        placeholder="Enter appointment date & time"
                        label="Appointment Date & Time"
                        name="appointmentDate"
                      />
                    </div>
                  </div>
                  <div className="flex flex-row w-full justify-between items-center mt-5">
                    <div className="flex flex-col w-full">
                      <AreaInputComponent
                        required
                        type="text"
                        placeholder="Enter your message"
                        label="Appointment details"
                        name="appointmentDetails"
                      />
                    </div>
                  </div>
                  <button
                    disabled={mailLoading}
                    type="submit"
                    className="bg-custom-blue mt-10 text-center py-4 rounded-full w-full"
                  >
                    {mailLoading ? "Please wait..." : " Submit Request"}
                  </button>
                </form>
              </div>
            </div>
          </div>
          {/* energy impact */}
          <div className="flex md:flex-row flex-col bg-white md:px-40 py-16 md:items-start items-center md:justify-between">
            <div className="w-2/5 h-[500px] relative md:block hidden">
              <Image
                className="rounded-lg"
                layout="fill"
                objectFit="cover"
                alt="About Us"
                src={"/images/house-solar.jpg"}
                priority
              />
            </div>
            <div className="md:w-3/5  relative w-5/6 md:ml-10 md:pr-10 pr-0">
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
          </div>
          {/* security and safety */}
          <div className="flex md:flex-row flex-col bg-white md:px-40 py-16 md:items-start items-center md:justify-between">
            <div className="md:w-3/5  relative w-5/6 md:ml-10 md:pr-10 pr-0">
              <div className="flex">
                <div className="text-primary-green border-2 rounded-xxl py-2 px-4">
                  SECURITY & SAFETY
                </div>
              </div>
              <div
                className={`${robotoFont.className} font-bold text-primary-dark mt-2 md:text-[40px] text-[20px] font-[900px]`}
              >
                Safeguarding your
              </div>
              <div
                className={`${robotoFont.className} font-bold text-primary-green md:text-[40px] text-[20px] font-[700px]`}
              >
                property and loved ones
              </div>
              <div
                className={`${robotoFontBodyLight.className} text-black md:text-[20px] text-[10px] mt-5`}
              >
                <SlideUpComponent>
                  We provide customized surveillance solutions designed to give
                  you peace of mind. Whether for your home or business, our
                  state-of-the-art cameras and monitoring systems ensure
                  comprehensive coverage and unmatched reliability. Enhance your
                  security with our expert installations.
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
                    className={`${robotoFontBodyLight.className} text-black md:text-[20px] text-[7px] mt-2 md:w-1/2 w-4/5`}
                  >
                    Homes & Offices Secured
                  </div>
                </div>
              </div>
            </div>
            <div className="w-2/5 h-[500px] relative md:block hidden">
              <Image
                className="rounded-lg"
                layout="fill"
                objectFit="cover"
                alt="About Us"
                src={"/images/green-cam.jpg"}
                priority
              />
            </div>
          </div>
          {/* why choose us */}
          <div className="md:px-40 px-20 py-24 flex flex-col why-us items-center">
            <div className="flex">
              <div className="text-white border-2 rounded-xxl py-2 px-4">
                WHY CHOOSE US
              </div>
            </div>
            <div
              className={`${robotoFont.className} text-white md:text-[40px] text-[20px] font-[700px] md:w-1/2 text-center mt-10 md:mt-20`}
            >
              Benefits of choosing tri-p tech&apos;s Solutions
            </div>
            <div className="flex md:flex-row flex-col md:justify-between items-center md:items-start md:mt-16 mt-8">
              <div className="md:w-1/5 md:block flex flex-col items-center">
                <IoSnowSharp className="text-[50px]" />
                <div className="text-white text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                  Products & Service Warranty
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-center md:text-start text-white md:text-[20px] text-[15px] mt-7`}
                >
                  <SlideUpComponent>
                    All our installations and products comes with a 60 Month
                    Warranty available on request with period.
                  </SlideUpComponent>
                </div>
              </div>

              <div className="md:w-1/5 md:block flex flex-col items-center md:mt-0 mt-14">
                <IoGridSharp className="text-[50px]" />
                <div className="text-white text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                  Off-Grid Energy Reliance
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-center md:text-start text-white md:text-[20px] text-[15px] mt-7`}
                >
                  <SlideUpComponent>
                    Cost of maintaining our solar systems are very low compared
                    to other altern energy sources.
                  </SlideUpComponent>
                </div>
              </div>

              <div className="md:w-1/5 md:block flex flex-col items-center md:mt-0 mt-14">
                <IoCallSharp className="text-[50px]" />
                <div className="text-white text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                  24/7 Customer Support Service
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-center md:text-start text-white md:text-[20px] text-[15px] mt-7`}
                >
                  <SlideUpComponent>
                    From drafting proposals to submitting applications for
                    interconnectionn we are with you to the end.
                  </SlideUpComponent>
                </div>
              </div>

              <div className="md:w-1/5 md:block flex flex-col items-center md:mt-0 mt-14">
                <IoCashSharp className="text-[50px]" />
                <div className="text-white text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                  Flexible Rates and Plans
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-center md:text-start text-white md:text-[20px] text-[15px] mt-7`}
                >
                  <SlideUpComponent>
                    Our pricing mirrors our flexiblw service. Competitive rates
                    vary with project volume & size
                  </SlideUpComponent>
                </div>
              </div>
            </div>
          </div>
          {/* get cctv quote */}
          <div className="flex flex-row bg-white md:px-40 px-10 py-16 flex flex-row items-start justify-between">
            <div className="p-10 estimate w-full rounded-xl">
              <div className="flex flex-col md:w-1/2">
                <div
                  className={`${robotoFont.className} text-white md:text-[40px] text-[20px] font-[700px]`}
                >
                  Get Live CCTV Project Quotation
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-white md:ml-2 md:text-[20px] text-[15px] mt-5`}
                >
                  Just enter your numner of cameras, the number of entry and
                  exit points and get a quote instantly
                </div>
                <div className="flex">
                  <button
                    onClick={handleScrollToQuotationSection}
                    className="px-4 py-3 border border-w-4 border-white text-primary-dark bg-white rounded-full mt-5"
                  >
                    Get quote now
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* our latest videos */}
          <div className="md:px-40 py-20 flex flex-col bg-white items-center">
            <div className="flex">
              <div className="text-primary-green border-2 border-primary-green rounded-xxl py-2 md:px-10 px-5">
                OUR LATEST VIDEOS
              </div>
            </div>
            <div
              className={`${robotoFont.className} font-bold  text-black md:text-[36px] text-[20px] font-[700px] md:w-1/2 w-3/4 text-center mt-5`}
            >
              Check Our Youtube Channel To Keep Up
            </div>
            <div
              className={`${robotoFont.className} font-bold  text-primary-green md:text-[36px] text-[20px] font-[700px] md:w-1/2 w-3/4 text-center md:mt-5 mt-2`}
            >
              With Latest Printing Trends
            </div>
            <div className="flex md:flex-row flex-col justify-center mt-10">
              <div className="md:w-1/3 md:mr-10 md:px-0 px-5 md:mb-0 mb-10">
                <div className="w-full h-[200px] relative">
                  <Image
                    className="rounded-lg"
                    layout="fill"
                    objectFit="cover"
                    alt="About Us"
                    src={"/images/print-car.jpg"}
                    priority
                  />
                </div>
                <div className="text-black text-sm md:text-[20px] font-bold text-[10px] mt-10">
                  Rapid prototyping with speed, precision, and creativity
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-black md:text-[20px] text-[15px] md:mt-7 mt-3`}
                >
                  Our advanced printing technology and expert team are here to
                  help you achieve your vision
                </div>
              </div>

              <div className="md:w-1/3 md:mr-10 md:px-0 px-5 md:mb-0 mb-10">
                <div className="w-full h-[200px] relative">
                  <Image
                    className="rounded-lg"
                    layout="fill"
                    objectFit="cover"
                    alt="About Us"
                    src={"/images/print-car.jpg"}
                    priority
                  />
                </div>
                <div className="text-black text-sm md:text-[20px] font-bold text-[10px] mt-10">
                  Rapid prototyping with speed, precision, and creativity
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-black md:text-[20px] text-[15px] md:mt-7 mt-3`}
                >
                  Our advanced printing technology and expert team are here to
                  help you achieve your vision
                </div>
              </div>

              <div className="md:w-1/3 md:mr-10 md:px-0 px-5 md:mb-0 mb-10">
                <div className="w-full h-[200px] relative">
                  <Image
                    className="rounded-lg"
                    layout="fill"
                    objectFit="cover"
                    alt="About Us"
                    src={"/images/print-car.jpg"}
                    priority
                  />
                </div>
                <div className="text-black text-sm md:text-[20px] font-bold text-[10px] mt-10">
                  Rapid prototyping with speed, precision, and creativity
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-black md:text-[20px] text-[15px] md:mt-7 mt-3`}
                >
                  Our advanced printing technology and expert team are here to
                  help you achieve your vision
                </div>
              </div>
            </div>
            <div className="flex mt-10">
              <div className="text-custom-blue border-2 border-custom-blue rounded-xxl py-2 px-20">
                View latest videos
              </div>
            </div>
          </div>
          {/* Request a quote */}
          <div
            ref={quotationSectionRef}
            className="flex flex-col bg-white py-16 flex flex-row items-start justify-between border-2"
          >
            <div className="md:w-full md:h-[1000px] md:block hidden absolute">
              <Image
                className="rounded-lg"
                layout="fill"
                objectFit="contain"
                alt="About Us"
                src={"/images/curve-green.png"}
                priority
              />
            </div>
            <div className="sm:w-full sm:h-[1000px] sm:block md:hidden absolute">
              <Image
                width={600}
                className="rounded-lg"
                objectFit="cover"
                alt="About Us"
                src={"/images/curve-green.png"}
                priority
                height={600}
              />
            </div>
            <div className="z-20 w-full flex flex-col md:px-20 px-5 items-center  md:mt-32 mt-0">
              <div className="flex">
                <div className="text-white rounded-xxl py-2">
                  Request a Quote
                </div>
              </div>
              <div
                className={`${robotoFont.className} font-bold text-white md:text-[40px] text-[20px] font-[700px] md:w-1/2 text-center md:mt-5`}
              >
                get your free personlized quote today from our experts.
              </div>
              <form
                onSubmit={handleSubmitQuote}
                className="flex w-full md:flex-row flex-col p-10 md:mt-10 mt-5 justify-center bg-white rounded-xl"
              >
                <div className="md:w-2/5 md:mr-10">
                  <div
                    className={`${robotoFont.className} text-black md:text-[30px] text-[12px] font-[700px] w-1/2 text-start`}
                  >
                    Fill in your details
                  </div>
                  <div
                    className={`${robotoFontBodyLight.className} text-black md:text-[20px] text-[15px] mt-7`}
                  >
                    Our advanced printing technology and expert team are here to
                    help you achieve your vision
                  </div>
                  <div
                    className={`${robotoFontBodyLight.className} text-black md:text-[20px] text-[15px] mt-7`}
                  >
                    Take the first step towards a brighter, cleaner, and more
                    cosr-effectiv e future. Conatct us for free a personalized
                    quote and discover the countless benefits of switching to
                    alternative energy.
                  </div>
                  <div
                    className={`${robotoFontBodyLight.className} text-black md:text-[20px] text-[15px] mt-7`}
                  >
                    Connect with our experts to review your solar power needs,
                    cctv system or 3d printing needs either over the phone or
                    in-person.
                  </div>
                  <div className="flex flex-row items-center mt-16">
                    <IoCall className=" text-[20px] rounded-full text-custom-blue" />
                    <div className="text-black ml-5">
                      {process.env.NEXT_PUBLIC_COMPANY_PHONE}
                    </div>
                  </div>

                  <div className="flex flex-row items-center mt-5">
                    <IoLocation className="text-[20px] rounded-full text-custom-blue" />
                    <div className="text-black md:ml-5 ml-2">
                      {process.env.NEXT_PUBLIC_COMPANY_ADDRESS}
                    </div>
                  </div>

                  <div className="flex flex-row items-center mt-5">
                    <IoMailOpen className="text-[20px] rounded-full text-custom-blue" />
                    <div className="text-black  md:ml-5 ml-2 text-wrap break-words">
                      {process.env.NEXT_PUBLIC_SUPPORTEMAILADDRESS}
                    </div>
                  </div>
                </div>
                <div className="mx-4  w-px bg-primary-gray"></div>

                <div className="flex md:ml-10 flex-col md:w-2/6  mt-10 md:mt-0">
                  <div>
                    <div
                      className={`${robotoFont.className} text-black md:text-[20px] text-[12px] font-[700px] w-1/2 text-start`}
                    >
                      Personal Information
                    </div>
                    <div className="mt-5">
                      <InputComponent
                        required
                        label="Full name"
                        name="fullName"
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="flex flex-col w-full ml-0 mt-3">
                      <InputComponent
                        required
                        placeholder="Enter phone"
                        label="Phone number"
                        name="phone"
                      />
                    </div>

                    <div className="flex flex-col w-full mt-3">
                      <InputComponent
                        required
                        type="email"
                        placeholder="Enter email address"
                        label="Email address"
                        name="email"
                      />
                    </div>
                  </div>
                  <div className="mt-10">
                    <div className="mt-5">
                      <SelectInputComponent
                        required
                        name="serviceRequired"
                        label="Service required"
                        placeholder="Select a service"
                      />
                    </div>
                    <div className="mt-5">
                      <AreaInputComponent
                        required
                        name="fullDescription"
                        placeholder="Full Description"
                      />
                    </div>
                    <div className="mt-5">
                      <InputComponent
                        required
                        type="date"
                        Icon={
                          <IoCalendar className="text-[30px] text-primary-gray" />
                        }
                        placeholder="Enter appointment date & time"
                        label="Appointment Date & Time"
                        name="appointmentDate"
                      />
                    </div>

                    <button
                      disabled={mailLoading}
                      type="submit"
                      className="bg-custom-blue mt-10 text-center py-4 rounded-full w-full"
                    >
                      {mailLoading ? "Please wait..." : " Submit Request"}
                    </button>
                  </div>
                </div>
              </form>
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
      </div>
    </>
  );
}
