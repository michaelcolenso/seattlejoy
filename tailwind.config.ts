import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#bd1550',
        'map-dark': '#1a1a2e',
        'tier-1': '#f9c784',
        'tier-2': '#f4845f',
        'tier-3': '#e84545',
        'tier-4': '#bd1550',
        'tier-5': '#6d0000',
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
};

export default config;
