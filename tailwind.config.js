/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'amber-gold': '#f59e0b',
        'neon-amber': '#f59e0b',
        'neon-cyan': '#f59e0b',
        'neon-blue': '#fbbf24',
        'neon-purple': '#f59e0b',
        'neon-pink': '#d97706',
        'white': '#ffffff',
        'neon-green': '#f59e0b',
        'neon-orange': '#d97706',
        'dark-base': '#0b0e14',
        'dark-panel': '#141923',
        'dark-card': '#1c2331',
        'dark-border': '#2b3548',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff05' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'neon-amber': '0 0 20px rgba(245, 158, 11, 0.35)',
        'neon-cyan': '0 0 20px rgba(245, 158, 11, 0.35)',
        'neon-blue': '0 0 20px rgba(251, 191, 36, 0.3)',
        'neon-purple': '0 0 20px rgba(245, 158, 11, 0.3)',
        'neon-pink': '0 0 20px rgba(217, 119, 6, 0.3)',
        'neon-green': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-sm': '0 0 10px rgba(245, 158, 11, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
