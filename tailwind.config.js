/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class", // Add this line to enable dark: prefix classes
  theme: {
    extend: {
      fontFamily: {
        "proximanova-thin": ["ProximaNova-Thin"],
        "proximanova-light": ["ProximaNova-Light"],
        "proximanova-regular": ["ProximaNova-Regular"],
        "proximanova-medium": ["ProximaNova-Medium"],
        "proximanova-semibold": ["ProximaNova-Semibold"],
        "proximanova-bold": ["ProximaNova-Bold"],
        "proximanova-black": ["ProximaNova-Black"],
      },

      colors: {
        // Light mode colors (your existing ones)
        primary: "#111111",
        secondary: "#7A7A7A",
        placeholder: "#7D7D7D",

        // Add dark mode variants
        dark: {
          primary: "#FFFFFF", // White text for dark mode
          secondary: "#D1D5DB", // Light gray for dark mode
          placeholder: "#9CA3AF", // Lighter placeholder for dark mode
          background: "#111827", // Dark background
          surface: "#1F2937", // Dark surface/card background
          border: "#374151", // Dark border color
        },
      },
    },
  },
  plugins: [],
};
