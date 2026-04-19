import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './store/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ytBlack: '#030303',
        ytDark: '#0f0f0f',
        ytGray: '#181818',
        ytBorder: '#1e1e1e',
        ytBorderActive: '#303030',
        ytRed: '#ff0000',
        ytHover: '#ffffff1a',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
export default config;
