import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: "#0B0F1F",
          card: "#161A2E",
        },
        brand: {
          purple: "#6D28D9",
          indigo: "#4338CA",
          pink: "#EC4899",
        },
        risk: {
          low: "#22C55E",
          medium: "#F59E0B",
          high: "#EF4444",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(90deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)",
        "gauge-track": "linear-gradient(90deg, #22C55E 0%, #EAB308 33%, #F97316 66%, #EF4444 100%)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
