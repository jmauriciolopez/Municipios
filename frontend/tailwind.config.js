/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores Normativos de Seguridad (ISO/ANSI)
        safety: {
          danger: '#D32F2F',    // Rojo: Parada, prohibición, equipo contra incendio
          warning: '#F57C00',   // Naranja: Advertencia de partes peligrosas
          caution: '#FBC02D',   // Amarillo: Precaución, riesgo físico
          success: '#388E3C',   // Verde: Condición segura, primeros auxilios
          info: '#1976D2',      // Azul: Obligación (uso de EPP)
        },
        // Escala de grises técnica para UI limpia
        ui: {
          base: '#F8FAFC',      // Fondo principal
          surface: '#FFFFFF',   // Fondo de tarjetas/modales
          border: '#E2E8F0',    // Bordes sutiles
          text: {
            primary: '#1E293B', // Texto principal (Slate 800)
            secondary: '#64748B',// Texto descriptivo (Slate 500)
          }
        }
      },
      fontFamily: {
        // Fuentes sans-serif de alta legibilidad
        sans: ['Inter', 'Roboto', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Recomendado para formularios de inspección
  ],
}
