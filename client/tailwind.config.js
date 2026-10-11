/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0d14',
        foreground: '#f3f4f6',
        card: {
          DEFAULT: '#111622',
          foreground: '#f3f4f6',
          hover: '#161c2b',
        },
        primary: {
          DEFAULT: '#6366f1', // Vibrant modern indigo accent
          foreground: '#ffffff',
          hover: '#4f46e5',
          light: '#818cf8',
          glow: 'rgba(99, 102, 241, 0.35)',
        },
        secondary: {
          DEFAULT: '#192033',
          foreground: '#e2e8f0',
        },
        muted: {
          DEFAULT: '#1e2638',
          foreground: '#94a3b8',
        },
        accent: {
          DEFAULT: '#f59e0b',
          foreground: '#ffffff',
        },
        border: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 35px -5px rgba(99, 102, 241, 0.45)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
