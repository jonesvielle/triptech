import React, { useEffect, useRef, useState } from "react";

interface CountUpProps {
  target: number;
  duration?: number;
  addedString?: string;
}

const CountUp: React.FC<CountUpProps> = ({
  target,
  duration = 2000,
  addedString = "",
}) => {
  const [count, setCount] = useState(0);
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

  useEffect(() => {
    if (isVisible) {
      const start = performance.now();
      const end = start + duration;
      const increment = Math.ceil(target / (duration / 100));

      const countInterval = (currentTime: number) => {
        if (currentTime < end) {
          setCount((prevCount) => Math.min(prevCount + increment, target));
          requestAnimationFrame(countInterval);
        } else {
          setCount(target);
        }
      };

      requestAnimationFrame(countInterval);
    }
  }, [isVisible, target, duration]);

  return (
    <div ref={ref} className="flex flex-row  text-center md:text-start">
      {count}
      {addedString}
    </div>
  );
};

export default CountUp;
