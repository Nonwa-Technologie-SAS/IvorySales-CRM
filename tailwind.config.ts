import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#111111",
        accent: "#6C5DD3",
        bgGray: "#f4f4f4",
      },
      boxShadow: {
        neu: "6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff",
      },
      borderRadius: {
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
