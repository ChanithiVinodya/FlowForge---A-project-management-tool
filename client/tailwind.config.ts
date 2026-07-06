/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0C1519', // Chinese Black
        foreground: '#F5F5F5',
        card: {
          DEFAULT: '#162127', // Dark Jungle Green
          foreground: '#F5F5F5',
        },
        popover: {
          DEFAULT: '#162127',
          foreground: '#F5F5F5',
        },
        primary: {
          DEFAULT: '#CF9D7B', // Antique Brass
          foreground: '#0C1519',
          '50': '#FAF3EE',
          '100': '#F3E5D9',
          '200': '#EACDB8',
          '300': '#DFAF8E',
          '400': '#CF9D7B',
          '500': '#BF8767',
          '600': '#A66E53',
          '700': '#8A5944',
          '800': '#6E4537',
          '900': '#57372D',
        },
        secondary: {
          DEFAULT: '#162127', // Dark Jungle Green
          foreground: '#F5F5F5',
        },
        muted: {
          DEFAULT: '#3A3534', // Jet
          foreground: '#A1A1AA',
        },
        accent: {
          DEFAULT: '#724B39', // Coffee
          foreground: '#F5F5F5',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FAF9F6',
        },
        border: 'rgba(207, 157, 123, 0.1)', // Antique Brass at low opacity
        input: 'rgba(207, 157, 123, 0.05)',
        ring: '#CF9D7B',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
        xl: '1.25rem',
        '2xl': '2rem',
        '3xl': '3rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

