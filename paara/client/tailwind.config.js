/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "Times New Roman", "serif"],
        body: ["DM Sans", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        urdu: ["Noto Nastaliq Urdu", "Cormorant Garamond", "serif"],
      },
    },
  },
  plugins: [],
};
