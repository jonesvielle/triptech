import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        euclidBold: ["euclid-bold", "sans-serif"],
        euclidMedium: ["euclid-medium", "sans-serif"],
        euclidLight: ["euclid-light", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "custom-white": "#FFFFFF",
        "custom-blue": "#001FA0",
        "primary-green": "#117865",
        "primary-dark": "#091629",
        "dark-green": "#004733",
        "primary-gray": "#D3D3D3",
        "secondary-gray": "#686868",
      },
      borderWidth: {
        "4": "4px",
      },
      screens: {
        xl: "1280px",
        xxl: "1536px", // 1920px
        xxxl: "2048px", // 2560px
      },
      borderRadius: {
        xl: "16px",
        xxl: "24px",
        xxxl: "32px",
      },
      animation: {
        slideUp: "slideUp 1.5s ease-out forwards",
        bounceIn: "bounceIn 5s ease forwards",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceIn: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
