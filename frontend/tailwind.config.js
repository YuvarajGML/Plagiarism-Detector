/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        primary: {
          DEFAULT: '#028090',
          dark: '#015f6b',
          light: '#e6f2f4',
        },
        exact: '#FEE2E2', // red-100
        near: '#FFEDD5',  // orange-100
        structural: '#FEF9C3', // yellow-100
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
        },
        log: {
          bg: '#1E293B',
          text: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
