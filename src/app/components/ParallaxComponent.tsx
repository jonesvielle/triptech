import React, { useEffect } from "react";

const ParallaxComponent = ({ backgroundImage }: { backgroundImage: any }) => {
  useEffect(() => {
    const parallaxEffect = () => {
      const scrollPosition = window.pageYOffset;
      const parallaxElement = document.querySelector(".parallax-bg");

      if (parallaxElement) {
        parallaxElement.style.transform = `translateY(${
          scrollPosition * 0.5
        }px)`;
      }
    };

    window.addEventListener("scroll", parallaxEffect);

    return () => {
      window.removeEventListener("scroll", parallaxEffect);
    };
  }, []);

  return (
    <section className="min-h-screen relative overflow-hidden bg-black">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-fixed parallax-bg"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <h1 className="text-4xl font-bold text-white animate__animated animate__fadeInUp">
          Welcome to Our Parallax Page
        </h1>
      </div>
    </section>
  );
};

export default ParallaxComponent;
