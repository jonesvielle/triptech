import React, { useEffect, useRef, useState } from "react";

interface BounceInComponentProps {
  children: React.ReactNode;
  className?: string;
}

const BounceInComponent: React.FC<BounceInComponentProps> = ({
  children,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-opacity duration-500 ${
        isVisible ? "animate-bounceIn" : "opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default BounceInComponent;
