import type { Config } from "tailwindcss";

import { Caveat } from 'next/font/google';

// Load the font
// const caveat = Caveat({
//   subsets: ['latin'],
//   weight: ['400', '700'],
//   variable: '--font-caveat', // Define CSS variable
// });

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F2F3F4",
        caribian_green: "#00DF81",
        bangaladish_green: "#03624C",
        dark_green:"#031B1B",
      },
      fontFamily:{
        sans: ['var(--font-fira)']
      }
    },
  },
  plugins: [],
} satisfies Config;
