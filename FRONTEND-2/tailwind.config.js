/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // VidFlow Brand Colors
        'brand-blue': '#2563eb',
        'brand-cyan': '#06b6d4',
        'brand-blue-dark': '#1d4ed8',
        'brand-cyan-dark': '#0891b2',

        // Semantic colors
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, #2563eb, #06b6d4)',
        'brand-gradient-vertical': 'linear-gradient(to bottom, #2563eb, #06b6d4)',
      },
      spacing: {
        'navbar': '3.5rem',      /* 56px */
        'sidebar': '16rem',      /* 256px */
        'sidebar-collapsed': '5rem', /* 80px */
      },
      borderRadius: {
        'vidflow': '0.75rem',   /* 12px - VidFlow standard */
      },
      boxShadow: {
        'vidflow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'vidflow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'vidflow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        'vidflow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}