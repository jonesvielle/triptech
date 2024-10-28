import React, { useState, useEffect } from "react";

interface TypeAnimationType {
  text: string;
  typingSpeed: number;
}

const TypingAnimation = ({
  text = "",
  typingSpeed = 100,
}: TypeAnimationType) => {
  const [displayedText, setDisplayedText] = useState(""); //

  useEffect(() => {
    let index = 0;

    // Use a recursive setTimeout to simulate typing
    const typeText = () => {
      setDisplayedText(text.substring(0, index + 1)); // Display the portion of the string up to index
      index++;
      if (index < text.length) {
        setTimeout(typeText, typingSpeed); // Continue typing
      }
    };

    typeText(); // Start typing effect
  }, [text, typingSpeed]);

  return (
    <div style={styles.typingContainer}>
      <h1>
        {displayedText}
        {/* <span style={styles.cursor}>|</span> */}
      </h1>
    </div>
  );
};

const styles = {
  typingContainer: {
    // fontFamily: "Courier, monospace", // Monospace font for typing effect
    // fontSize: "2rem",
    color: "white",
  },
  cursor: {
    marginLeft: "5px",
    animation: "blink 0.8s infinite", // Blinking cursor effect
  },
};

export default TypingAnimation;
