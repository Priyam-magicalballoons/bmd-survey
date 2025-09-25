// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/globals.css", // make sure this is included!
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
