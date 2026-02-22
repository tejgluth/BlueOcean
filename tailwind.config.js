import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F4F7FB',
        surface: '#FFFFFF',
        border: '#E5EAF2',
        header: '#0F4C81',
        accent: '#2563EB',
      },
      borderRadius: {
        xl: '14px',
      },
      boxShadow: {
        card: '0 8px 28px -18px rgba(15,23,42,0.18)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn .18s ease-out',
      },
    },
  },
  plugins: [forms],
};
