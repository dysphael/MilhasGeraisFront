/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#054A91',
        secondary: '#6EA4BF',
        accent: '#748944',
      },
    },
  },
  plugins: [],
}
