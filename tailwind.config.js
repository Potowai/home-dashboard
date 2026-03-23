/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-deep': 'var(--bg-deep)',
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-elevated': 'var(--bg-elevated)',
        'border-color': 'var(--border)',
        'border-bright': 'var(--border-bright)',
        'accent-color': 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        'accent-glow': 'var(--accent-glow)',
        'red-color': 'var(--red)',
        'red-dim': 'var(--red-dim)',
        'yellow-color': 'var(--yellow)',
        'blue-color': 'var(--blue)',
        'text-primary': 'var(--text)',
        'text-secondary': 'var(--text-secondary)',
        'text-dim': 'var(--text-dim)',
      },
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.05em',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'stagger': 'stagger 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        stagger: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        }
      },
      boxShadow: {
        'premium': '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
        'accent': '0 0 30px var(--accent-glow)',
        'brutal': '4px 4px 0px 0px var(--accent)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      }
    },
  },
  plugins: [],
}
