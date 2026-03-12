/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#14b8a6',
        accent: '#f59e0b',
        danger: '#dc2626',
        warning: '#f43f5e',
        success: '#10b981',
        info: '#0ea5e9',
        rose: '#f43f5e',
        pink: '#ec4899',
        violet: '#8b5cf6',
        indigo: '#6366f1',
        teal: '#14b8a6',
        cyan: '#22d3ee',
        sky: '#38bdf8',
        lime: '#84cc16',
        emerald: '#10b981',
        amber: '#f59e0b',
        orange: '#f97316',
        'gradient-start': '#ff9a9e',
        'gradient-end': '#fad0c4'
      },
      backgroundImage: {
        'hero-pattern': "url('/src/assets/hero-pattern.svg')",
        'footer-texture': "url('/src/assets/footer-texture.png')",
        'gradient-vertical': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
