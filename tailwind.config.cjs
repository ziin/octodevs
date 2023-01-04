/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      white: "#FFFFFF",
      gray: {
        900: "#191B1F",
        800: "#22272E",
        700: "#373E47",
        600: "#414952",
        500: "#778390",
        300: "#AEBAC7",
        200: "#CED9E5",
      },
      blue: {
        500: "#3570C7",
      },
      red: {
        600: "#AB3030",
        500: "#C73E3C",
        400: "#E35450",
        200: "#F2716B",
      },
    },
    extend: {
      backgroundImage: {
        worldmap: "url('/map.png')",
      },
    },
  },
  plugins: [],
};
