/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8B5CF6",
          dark: "#7C3AED",
        },
        secondary: {
          DEFAULT: "#06B6D4",
          dark: "#0891B2",
        },
        accent: "#3B82F6",
        severity: {
          critical: "#DC2626",
          high: "#F59E0B",
          medium: "#F97316",
          low: "#10B981",
        },
        dark: {
          100: "#0F172A",
          200: "#1E293B",
          300: "#334155",
        },
        light: {
          100: "#F1F5F9",
          200: "#CBD5E1",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-in-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
