module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./styling/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    borderRadius: {
      'none': '0',
      'sm': '0.125rem',
      DEFAULT: '0.25rem',
      DEFAULT: '4px',
      'md': '0.375rem',
      'lg': '0.5rem',
      'full': '9999px',
      'large': '12px',
      'xl': '48px',
    },
    extend: {
      colors: {
        "gray-1000": "#2d3748",
        "gray-1100": "#27303f",
        "gray-1200": "#1d242f",
        "blue-1000": "#007FFF",
        "blue-1100": "#004de6",
      },
    },
  },
  plugins: [require("daisyui")], // Add DaisyUI here
};
