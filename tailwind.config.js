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
        // Warm minimal dark palette
        'surface': 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'border-subtle': 'var(--border-subtle)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'accent': 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        'status-green': 'var(--status-green)',
        'status-amber': 'var(--status-amber)',
        'status-red': 'var(--status-red)',
        'graph-blue': 'var(--graph-blue)',
        'graph-purple': 'var(--graph-purple)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 16px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.4)',
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
      },
      animation: {
        'status-pulse': 'statusPulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
      },
      keyframes: {
        statusPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', maxHeight: '0' },
          to: { opacity: '1', maxHeight: '1000px' },
        },
      },
    },
  },
  plugins: [],
}
