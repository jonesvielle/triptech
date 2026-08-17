/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import "react-toastify/dist/ReactToastify.css"; // Import styles
import "../../styles/global.css";
import { ToastContainer, toast } from "react-toastify";
import {
  robotoFont,
  robotoFontBody,
  robotoFontBodyLight,
} from "./helpers/fonts";
import Image from "next/image";
import Link from "next/link";
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

type FeaturedVideo = {
  id: number;
  title: string;
  youtube_url: string;
  summary: string;
  thumbnail_url: string;
};

const fallbackVideos: FeaturedVideo[] = [
  {
    id: 0,
    title: "TRI-P Tech project updates",
    youtube_url: "https://www.youtube.com/@TRI-PTECH",
    summary: "Visit our YouTube channel for installation updates, product demos, and project stories.",
    thumbnail_url: "/images/print-car.jpg",
  },
];

function youtubeVideoId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,})/);
  return match?.[1] || "";
}

function videoThumbnail(video: FeaturedVideo) {
  if (video.thumbnail_url) return video.thumbnail_url;
  const id = youtubeVideoId(video.youtube_url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "/images/print-car.jpg";
}

// Define an interface for the form data
export default function Home() {
  const quotationSectionRef = useRef<HTMLDivElement>(null);
  const serviceSectionRef = useRef<HTMLDivElement>(null);

  const [mailLoading, setMailLoading] = useState(false);
  const [featuredVideos, setFeaturedVideos] = useState<FeaturedVideo[]>(fallbackVideos);

  useEffect(() => {
    fetch("/api/featured-videos")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.videos) && data.videos.length) {
          setFeaturedVideos(data.videos.slice(0, 3));
        }
      })
      .catch(() => undefined);
  }, []);

  const handleScrollToServiceSection = () => {
    serviceSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      setMailLoading(false);

      if (response.ok) {
        toast.success("Appointment was sent successfully", { autoClose: 5000 });
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
          The quote request has been received.
      </p>
    </div>
  </body>
</html>

          `,
        }),
      });

      const responseData = await response.json();
      setMailLoading(false);

      if (response.ok) {
        toast.success("Quote request sent successfully", { autoClose: 5000 });
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

    // Create a new FormData object
    const formData = new FormData(event?.target);
    // console.log("formData: " + JSON.stringify(formData))
    let payload = {};
    // Optional: Log form data for debugging
    for (const [key, value] of formData?.entries()) {
      // console.log("loger", key, value);
      payload = { ...payload, [key]: value };
    }
    if (payload) {
      handleSubmitMailBook(payload);
    }
  };

  const handleSubmitQuote = (event: FormEvent<HTMLFormElement>) => {
    setMailLoading(true);
    event.preventDefault();

    // Create a new FormData object
    const formData = new FormData(event?.target);
    // console.log("formData: " + JSON.stringify(formData))
    let payload = {};
    // Optional: Log form data for debugging
    for (const [key, value] of formData?.entries()) {
      // console.log("loger", key, value);
      payload = { ...payload, [key]: value };
    }
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
          <div className="hero flex flex-col w-full pb-16 bg-red-00">
            {/* <div className="hero-background-overlay" /> */}
            <video autoPlay loop muted playsInline className="background-video">
              {/* <div className="hero-background-overlay" /> */}
              <source src="/images/hero-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="color-overlay"></div>

            <div className="flex z-70 flex-row items-center justify-center w-full md:mt-52 mt-36  mb-5 px-0 md:px-20">
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
                    <div className="md:mb-20 mb-20">
                      <div
                        className={`${robotoFont.className} text-[30px] md:text-[60px] font-bold`}
                      >
                        Practical power, security, and product solutions for
                        homes and businesses
                      </div>
                      <div className="mt-10 md:text-[20px] text-[15px] font-euclidLight text-center">
                        <SlideUpComponent>
                          TRI-P Tech Limited delivers solar systems, CCTV
                          installation, 3D printing, and product design support
                          with a focus on exceptional results.
                        </SlideUpComponent>
                      </div>
                    </div>

                    {/* Slide 2 */}
                    <div className="md:mb-20 mb-20">
                      <div
                        className={`${robotoFont.className} text-[30px] md:text-[60px] font-bold`}
                      >
                        Turn product ideas into usable parts and prototypes
                      </div>
                      <div className="mt-10 md:text-[20px] text-[15px] font-euclidLight text-center">
                        <SlideUpComponent>
                          Move from sketch, sample, or concept to physical
                          parts that can be tested, improved, and produced.
                        </SlideUpComponent>
                      </div>
                    </div>

                    {/* Slide 3 */}
                    <div className="md:mb-20 mb-20">
                      <div
                        className={`${robotoFont.className} text-[30px] md:text-[60px] font-bold`}
                      >
                        Secure your property with planned CCTV coverage
                      </div>
                      <div className="mt-10 md:text-[20px] text-[15px] font-euclidLight text-center">
                        <SlideUpComponent>
                          We plan camera coverage around blind spots, access
                          points, storage needs, and remote monitoring.
                        </SlideUpComponent>
                      </div>
                    </div>
                  </Carousel>
                </div>

                <div className="text-white-500 flex flex-col items-center justify-center gap-4 md:mt-16 mt-8 md:flex-row">
                  <button
                    onClick={handleScrollToServiceSection}
                    className="w-full max-w-[340px] border border-white px-5 py-3.5 rounded-full bg-white text-center font-semibold text-custom-blue shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 md:w-auto"
                  >
                    Explore Our Services
                  </button>
                  <Link
                    href="/services/solar/calculator"
                    className="flex w-full max-w-[340px] items-center justify-center px-5 py-3.5 border border-custom-blue bg-custom-blue text-center font-semibold text-white rounded-full shadow-[0_14px_30px_rgba(0,35,170,0.24)] transition hover:-translate-y-0.5 hover:bg-custom-blue/90 md:w-auto"
                  >
                    Get a quote
                  </Link>
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
          <div className="bg-white md:px-20  py-16 flex flex-col items-center">
            <div className="text-primary-green border-2 rounded-xxl py-2 px-4">
              TRI-P Tech Limited
            </div>
            <div
              className={`${robotoFont.className} md:px-0 px-8 font-bold md:text-start text-center text-primary-dark mt-5 mb-10 md:text-[40px] text-[20px]`}
            >
              Powering & Securing Nigeria Since 2021
            </div>
            <div className="flex flex-row  justify-center">
              <div className={`md:w-2/5 w-4/5 text-black`}>
                <p
                  className={`${robotoFontBody.className} md:text-[23px] text-[15px] md:text-start text-center`}
                >
                  TRI-P Tech Limited is an indigenous solar energy,
                  security systems, and product modelling company based in
                  Nigeria.
                </p>
                <div
                  className={`${robotoFontBody.className} md:text-[23px] text-[15px] mt-5 md:text-start text-center`}
                >
                  Since 2021, we have supported customers with solar energy,
                  CCTV installation, 3D modelling, 3D printing, and design
                  consultation across Nigeria.
                </div>
                <div className="md:mt-0 mt-5">
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
                    <div>500+ CCTV</div>
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
              <div>Satisfied Clients</div>
            </div>
          </div>
          {/* our services */}
          <div
            ref={serviceSectionRef}
            className="bg-white px-5 py-16 md:px-10"
          >
            <div className="mx-auto max-w-7xl">
              <div
                className={`inline-flex rounded-full border-2 px-5 py-2 text-primary-green`}
              >
                OUR SERVICES
              </div>
              <div
                className={`${robotoFont.className} mt-5 max-w-4xl text-center text-[30px] font-bold leading-tight text-primary-dark md:text-start md:text-[44px]`}
              >
                Practical engineering services
              </div>
              <div
                className={`${robotoFont.className} max-w-4xl text-center text-[30px] font-bold leading-tight text-primary-green md:text-start md:text-[44px]`}
              >
                built around your project
              </div>
              <div
                className={`${robotoFontBodyLight.className} mt-5 max-w-5xl text-center text-[16px] leading-8 text-black md:text-start md:text-[20px]`}
              >
                <SlideUpComponent>
                  At TRI-P Tech Limited, we offer manufacturing, security,
                  design, and electrification services tailored to your project
                  requirements from planning to delivery.
                </SlideUpComponent>
              </div>
            </div>
            <div className="mx-auto mt-10 grid w-full max-w-7xl grid-cols-1 justify-items-center gap-6 md:grid-cols-3">
              <div className="group relative h-[400px] w-full max-w-[360px] overflow-hidden rounded-xxl shadow-[0_18px_45px_rgba(3,48,62,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(3,48,62,0.16)]">
                  <Image
                    className="rounded-xxl transition duration-500 group-hover:scale-105"
                    layout="fill"
                    objectFit="cover"
                    alt="Solar panels installed on a roof"
                    src={"/images/solar-array.jpg"}
                    priority
                    style={{ zIndex: 1 }}
                  />
                  <div className="absolute inset-0 z-50 rounded-xxl bg-gradient-to-b from-black/5 via-black/30 to-black/90 opacity-100">
                    <div className="absolute text-white z-[150] bottom-0 mb-12 px-5 opacity-100">
                      <div className="font-bold">Custom Solar Installation</div>
                      <div className="mt-2 text-[15px] leading-6 z-[150]">
                        We design and install practical solar systems for homes,
                        businesses, and project sites.
                      </div>
                      <div className="flex flex-row mt-4">
                        <Link
                          href="/services/solar"
                          className="border border-white px-4 py-2 rounded-full mt-5 bg-white text-custom-blue text-[15px] z-[150]"
                        >
                          Learn more
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

              <div className="group relative h-[400px] w-full max-w-[360px] overflow-hidden rounded-xxl shadow-[0_18px_45px_rgba(3,48,62,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(3,48,62,0.16)]">
                  <Image
                    className="rounded-xxl transition duration-500 group-hover:scale-105"
                    layout="fill"
                    objectFit="cover"
                    alt="CCTV security camera installation"
                    src={"/images/secure-cam.jpg"}
                    priority
                    style={{ zIndex: 1 }}
                  />
                  <div className="absolute inset-0 z-50 rounded-xxl bg-gradient-to-b from-black/5 via-black/35 to-black/90 opacity-100">
                    <div className="absolute text-white z-[150] bottom-0 mb-12 px-5 opacity-100">
                      <div className="font-bold">Custom CCTV Installation</div>
                      <div className="mt-2 text-[15px] leading-6 z-[150]">
                        We set up CCTV systems that help protect homes, offices,
                        staff, property, and clients.
                      </div>
                      <div className="flex flex-row mt-4">
                        <Link
                          href="/services/cctv-installation"
                          className="border border-white px-4 py-2 rounded-full mt-5 bg-white text-custom-blue text-[15px] z-[150]"
                        >
                          Learn more
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

              <div className="group relative h-[400px] w-full max-w-[360px] overflow-hidden rounded-xxl shadow-[0_18px_45px_rgba(3,48,62,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(3,48,62,0.16)]">
                  <Image
                    className="rounded-xxl transition duration-500 group-hover:scale-105"
                    layout="fill"
                    objectFit="cover"
                    alt="3D printer producing a model"
                    src={"/images/print-car.jpg"}
                    priority
                    style={{ zIndex: 1 }}
                  />
                  <div className="absolute inset-0 z-50 rounded-xxl bg-gradient-to-b from-black/5 via-black/35 to-black/90 opacity-100">
                    <div className="absolute text-white z-[150] bottom-0 mb-12 px-5 opacity-100">
                      <div className="font-bold">3D Printing & Machining</div>
                      <div className="mt-2 text-[15px] leading-6 z-[150]">
                        We support product ideas, prototypes, custom parts, and
                        precise fabrication work.
                      </div>
                      <div className="flex flex-row mt-4">
                        <Link
                          href="/services/3d-printing"
                          className="border border-white px-4 py-2 rounded-full mt-5 bg-white text-custom-blue text-[15px] z-[150]"
                        >
                          Learn more
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
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
                  Schedule a consultation with one of our experts
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-white ml-2 md:text-[20px] text-[15px] mt-5  md:text-start text-center`}
                >
                  <SlideUpComponent>
                    We offer in-person and video consultations for solar power,
                    security systems, product design, modelling, and 3D
                    printing projects across Nigeria.
                  </SlideUpComponent>
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-white ml-2 md:text-[20px] text-[15px] mt-5  md:text-start text-center`}
                >
                  <SlideUpComponent>
                    Our team reviews your requirements, recommends practical
                    options, and helps you plan the next step with confidence.
                  </SlideUpComponent>
                </div>
              </div>
              <div className="md:w-2/3 w-5/6 md:p-10 p-5 bg-white rounded-xl md:mt-0 mt-10">
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
                    {mailLoading ? "Please wait..." : "Submit request"}
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
                  We plan CCTV systems around real blind spots, access points,
                  storage needs, and remote viewing. From homes to business
                  sites, TRI-P Tech installs practical security coverage that is
                  easy to monitor and maintain.
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
                    <CountUp target={500} duration={5000} addedString="+" />
                  </div>
                  <div
                    className={`${robotoFontBodyLight.className} text-black md:text-[20px] text-[7px] mt-2 md:w-1/2 w-4/5`}
                  >
                    CCTV Systems Installed
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
              Benefits of choosing TRI-P Tech solutions
            </div>
            <div className="flex md:flex-row flex-col md:justify-between items-center md:items-start md:mt-16 mt-8">
              <div className="md:w-1/5 md:block flex flex-col items-center">
                <IoSnowSharp className="text-[50px]" />
                <div className="text-white text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                  Product and service warranty
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-center md:text-start text-white md:text-[20px] text-[15px] mt-7`}
                >
                  <SlideUpComponent>
                    Our installations are delivered with clear warranty
                    guidance and support terms.
                  </SlideUpComponent>
                </div>
              </div>

              <div className="md:w-1/5 md:block flex flex-col items-center md:mt-0 mt-14">
                <IoGridSharp className="text-[50px]" />
                <div className="text-white text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                  Off-grid energy reliability
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-center md:text-start text-white md:text-[20px] text-[15px] mt-7`}
                >
                  <SlideUpComponent>
                    Properly sized solar systems can reduce generator use and
                    improve day-to-day power stability.
                  </SlideUpComponent>
                </div>
              </div>

              <div className="md:w-1/5 md:block flex flex-col items-center md:mt-0 mt-14">
                <IoCallSharp className="text-[50px]" />
                <div className="text-white text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                  Responsive customer support
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-center md:text-start text-white md:text-[20px] text-[15px] mt-7`}
                >
                  <SlideUpComponent>
                    We support customers from first enquiry to project review,
                    installation, and follow-up.
                  </SlideUpComponent>
                </div>
              </div>

              <div className="md:w-1/5 md:block flex flex-col items-center md:mt-0 mt-14">
                <IoCashSharp className="text-[50px]" />
                <div className="text-white text-sm md:text-[20px] font-bold text-[10px] md:mt-10 mt-5 md:text-start text-center">
                  Practical pricing guidance
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-center md:text-start text-white md:text-[20px] text-[15px] mt-7`}
                >
                  <SlideUpComponent>
                    We help customers understand project cost based on load,
                    equipment selection, site needs, and installation scope.
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
                  Get a CCTV project quote
                </div>
                <div
                  className={`${robotoFontBodyLight.className} text-white md:ml-2 md:text-[20px] text-[15px] mt-5`}
                >
                  Tell us the number of cameras, entry points, and exit points
                  so we can estimate the project scope.
                </div>
                <div className="flex">
                  <Link
                    href="/services/cctv-installation#cctv-quote"
                    className="px-4 py-3 border border-w-4 border-white text-primary-dark bg-white rounded-full mt-5"
                  >
                    Get quote now
                  </Link>
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
              Watch the latest
            </div>
            <div
              className={`${robotoFont.className} font-bold  text-primary-green md:text-[36px] text-[20px] font-[700px] md:w-1/2 w-3/4 text-center md:mt-5 mt-2`}
            >
              TRI-P Tech updates
            </div>
            <div className="mt-12 grid w-full max-w-6xl grid-cols-1 justify-items-center gap-8 px-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredVideos.map((video) => (
                <a
                  key={video.id}
                  href={video.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block w-full max-w-sm rounded-xl border border-[#d8e7e3] bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-primary-green hover:shadow-[0_18px_38px_rgba(17,120,101,0.14)]"
                >
                  <div className="relative h-[210px] w-full overflow-hidden rounded-lg bg-[#082c3a] shadow-sm">
                    <img
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      alt={video.title}
                      src={videoThumbnail(video)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#082c3a]/70 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-primary-dark">
                      Watch on YouTube
                    </span>
                  </div>
                  <div className="mt-6 text-base font-bold text-black transition group-hover:text-primary-green md:text-[20px]">
                    {video.title}
                  </div>
                  <div
                    className={`${robotoFontBodyLight.className} mx-auto mt-3 max-w-xs text-[15px] leading-7 text-black md:text-[18px]`}
                  >
                    {video.summary || "Watch this update from TRI-P Tech."}
                  </div>
                </a>
              ))}
            </div>
            <div className="flex mt-10 justify-center">
              <a
                href="https://www.youtube.com/@TRI-PTECH"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-custom-blue px-10 py-3 text-center font-semibold text-custom-blue transition hover:bg-custom-blue hover:text-white md:px-20"
              >
                View latest videos
              </a>
            </div>
          </div>
          {/* Request a quote */}
          <div
            ref={quotationSectionRef}
            className="bg-white px-5 py-16 md:px-10"
          >
            <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-[#cfe3df] bg-[#f6fbfa] shadow-[0_24px_70px_rgba(3,48,62,0.08)]">
              <div className="grid gap-8 p-6 md:grid-cols-[1fr_0.9fr] md:p-10 lg:p-14">
                <div>
                  <div className="inline-flex rounded-full border border-[#b8d8d2] bg-white px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-green">
                    Solar quote calculator
                  </div>
                  <h2
                    className={`${robotoFont.className} mt-6 max-w-3xl text-[32px] font-bold leading-tight text-primary-dark md:text-[48px]`}
                  >
                    Start your solar estimate with practical load details.
                  </h2>
                  <p
                    className={`${robotoFontBodyLight.className} mt-6 max-w-2xl text-[16px] leading-8 text-[#264955] md:text-[19px]`}
                  >
                    Instead of a basic form, the calculator captures your loads,
                    daily usage, equipment recommendation, and estimated system
                    cost before TRI-P reviews the final quote.
                  </p>
                  <p
                    className={`${robotoFontBodyLight.className} mt-4 max-w-2xl text-[16px] leading-8 text-[#264955] md:text-[19px]`}
                  >
                    It gives our engineers better information and helps you see
                    what the project may require before a site inspection.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 text-[15px] text-primary-dark sm:flex-row sm:flex-wrap">
                    <div className="inline-flex items-center rounded-full bg-white px-4 py-3 shadow-sm">
                      <IoCall className="mr-3 text-[18px] text-custom-blue" />
                      {process.env.NEXT_PUBLIC_COMPANY_PHONE}
                    </div>
                    <div className="inline-flex items-center rounded-full bg-white px-4 py-3 shadow-sm">
                      <IoMailOpen className="mr-3 text-[18px] text-custom-blue" />
                      {process.env.NEXT_PUBLIC_SUPPORTEMAILADDRESS}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-full rounded-[24px] border border-[#d5e7e4] bg-white p-6 shadow-sm md:p-8">
                    <div className="inline-flex rounded-full bg-[#edf8f5] px-4 py-2 text-sm font-semibold text-primary-green">
                      Quote journey
                    </div>
                    <div className="mt-7 space-y-5 text-primary-dark">
                      {[
                        "Enter appliances and operating hours",
                        "Review battery, inverter, panel, and cost estimate",
                        "Send a complete quote request to TRI-P",
                      ].map((item, index) => (
                        <div key={item} className="flex items-start">
                          <span className="mr-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-custom-blue text-sm font-bold text-white">
                            {index + 1}
                          </span>
                          <span className="pt-1 text-[15px] leading-6">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/services/solar/calculator"
                      className="mt-8 block rounded-full bg-custom-blue px-6 py-4 text-center font-bold text-white shadow-[0_16px_32px_rgba(0,41,173,0.18)] transition hover:-translate-y-0.5 hover:bg-primary-green"
                    >
                      Open solar calculator
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
      </div>
    </>
  );
}

