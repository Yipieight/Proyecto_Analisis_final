/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        accent: 'var(--accent-color)',
        'main-text': 'var(--main-text-color)',
        'secondary-text': 'var(--secondary-text-color)',
        'light-background': 'var(--light-background)',
      },
    },
  },
  plugins: [],
};