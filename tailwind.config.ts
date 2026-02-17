import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'earthbrain-blue': {
          50: '#e6f2ff',
          100: '#bfddff',
          200: '#99c9ff',
          300: '#73b5ff',
          400: '#4da0ff',
          500: '#2E75B6',
          600: '#1F4E79',
          700: '#00B0F0',
        },
      },
    },
  },
  plugins: [],
}

export default config
