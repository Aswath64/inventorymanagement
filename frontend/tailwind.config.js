/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic Brand Palette
        brand: {
          primary: '#6366F1', // Indigo 500
          secondary: '#EC4899', // Pink 500
          accent: '#06B6D4', // Cyan 500
        },

        // Semantic Surface Tokens
        surface: {
          DEFAULT: '#ffffff', // Pure white
          muted: '#F8FAFC',   // Slate 50
          glass: 'rgba(255, 255, 255,var(--glass-opacity))',
          raised: '#ffffff',

          // Dark mode surfaces
          dark: {
            DEFAULT: '#0F172A', // Slate 900
            muted: '#1E293B',   // Slate 800
            glass: 'rgba(15, 23, 42, var(--glass-opacity))',
            raised: '#1E293B',
          }
        },

        // Action Colors (Semantic)
        primary: {
          DEFAULT: '#4F46E5', // Indigo 600
          soft: '#E0E7FF',    // Indigo 100
          dark: '#3730A3',    // Indigo 800
        },

        // Status Indicators
        status: {
          success: '#10B981', // Emerald 500
          warning: '#F59E0B', // Amber 500
          error: '#EF4444',   // Red 500
          info: '#3B82F6',    // Blue 500
        },

        // Legacy Cartoon Palette Mapping (for backward compatibility if needed)
        'cartoon-blue': { 500: '#0EA5E9' },
        'cartoon-green': { 500: '#22C55E' },
        'cartoon-yellow': { 500: '#EAB308' },
        'cartoon-red': { 500: '#EF4444' },
      },

      // Z-Index Governance
      zIndex: {
        'glass': '10',
        'dropdown': '20',
        'sticky': '30',
        'navbar': '40',
        'modal-backdrop': '50',
        'modal': '60',
        'toast': '70',
        'tooltip': '80',
      },

      // Border Radius Governance
      borderRadius: {
        'xs': '0.125rem',
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },

      // Typography
      fontFamily: {
        heading: ['"Fredoka"', 'Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },

      // Box Shadows for Depth
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
        'surface': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'surface-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'surface-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow-primary': '0 0 15px rgba(99, 102, 241, 0.3)',
      },

      // Animations
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce-gentle 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        }
      },
    },
  },
  plugins: [],
}
