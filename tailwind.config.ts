import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "leaf-green": "#4F6C45",
        "dranks-orange": "#F9A613",
        "light-orange": "#FFF7EA",
        "white-pink": "#FCF6F5",
      },
      fontFamily: {
        comico: ["Comico-Regular", "fantasy"],
        satoshi: ["Satoshi-Variable", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
