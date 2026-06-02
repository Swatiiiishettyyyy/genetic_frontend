/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        nucleotide: {
          ink: "#161616",
          muted: "#828282",
          purple: "#8B5CF6",
          lavender: "#E7E1FF",
          surface: "#F9F9F9",
          night: "#101129",
          indigo: "#2A2C5B",
          sea: "#41C9B3",
          orange: "#EA8C5A",
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        "fluid-xs": ["clamp(0.875rem, 0.82rem + 0.28vw, 1.25rem)", { lineHeight: "1.45" }],
        "fluid-sm": ["clamp(1rem, 0.94rem + 0.3vw, 1.125rem)", { lineHeight: "1.5" }],
        "fluid-md": ["clamp(1rem, 0.88rem + 0.6vw, 1.25rem)", { lineHeight: "1.45" }],
        "fluid-lg": ["clamp(1.25rem, 1.12rem + 0.65vw, 1.5rem)", { lineHeight: "1.125" }],
        "fluid-xl": ["clamp(1.625rem, 1.32rem + 0.95vw, 2rem)", { lineHeight: "1.05" }],
        "fluid-avatar-sm": ["clamp(1.25rem, 1rem + 0.8vw, 1.5rem)", { lineHeight: "1.125" }],
        "fluid-avatar-lg": ["clamp(1.625rem, 1.25rem + 1.2vw, 2rem)", { lineHeight: "1.125" }],
      },
      boxShadow: {
        nucleotide: "0 4px 156.2px rgba(136, 107, 249, 0.23)",
        soft: "0 24px 80px rgba(139, 92, 246, 0.14)",
      },
    },
  },
  plugins: [],
};
