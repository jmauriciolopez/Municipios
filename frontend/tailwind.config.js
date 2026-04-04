/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Soporte para modo oscuro con clase .dark
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores de Seguridad Normativos (ISO/ANSI) - Refinados para contraste
        safety: {
          danger: {
            DEFAULT: '#DC2626', // Red 600
            light: '#FEE2E2',   // Red 100
            dark: '#991B1B',    // Red 800
          },
          warning: {
            DEFAULT: '#EA580C', // Orange 600
            light: '#FFEDD5',   // Orange 100
            dark: '#9A3412',    // Orange 800
          },
          caution: {
            DEFAULT: '#D97706', // Amber 600
            light: '#FEF3C7',   // Amber 100
            dark: '#92400E',    // Amber 800
          },
          success: {
            DEFAULT: '#16A34A', // Green 600
            light: '#DCFCE7',   // Green 100
            dark: '#166534',    // Green 800
          },
          info: {
            DEFAULT: '#2563EB', // Blue 600
            light: '#DBEAFE',   // Blue 100
            dark: '#1E40AF',    // Blue 800
          },
        },
        // Paleta Premium Base (Zinc/Neutral/Indigo)
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#dae3ff',
          300: '#bdcbff',
          400: '#94a7ff',
          500: '#6d7bff', // Primary Modern Blue (Indigo-ish)
          600: '#4a4eff',
          700: '#3a39e6',
          800: '#3230bc',
          900: '#2d2e95',
          950: '#1c1c57',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          sunken: '#F8FAFC',
          border: '#E2E8F0',
          dark: '#0f172a',
        }
      },
      fontFamily: {
        // Inter es la fuente premium estándar por excelencia
        sans: ['Inter var', 'Inter', 'Roboto', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'premium-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'premium-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

