import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1B3A5C',
        accent: '#FF6B2C',
      },
      fontFamily: {
        body: ['var(--font-body)', 'DM Sans', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'Bricolage Grotesque', 'sans-serif'],
        sans: ['var(--font-body)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
