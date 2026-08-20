/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Tiefenskala des Hintergrunds: 950 = Weltraum, 700 = angehobene Fläche.
        space: {
          975: '#020208',
          950: '#04040c',
          900: '#080814',
          850: '#0b0b1b',
          800: '#0e0e22',
          700: '#161636',
          600: '#1f1f47',
        },
        // Kaltes Sternenlicht für Text und Linien.
        light: {
          500: '#6d9cf2',
          400: '#8ab4ff',
          300: '#a9c7ff',
          200: '#cfe0ff',
          100: '#e8eeff',
        },
        // Warme Akzentfarbe = der Lichtstrahl selbst.
        beam: {
          DEFAULT: '#ffd76a',
          soft: '#ffe9a8',
          deep: '#e0ab2c',
        },
        // Kühler Zweitakzent für die Lichtfront.
        front: '#7fe9ff',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.16em',
      },
      maxWidth: {
        // Ein Raster für die ganze Seite – Kopfzeile, Inhalt, Szene, Footer.
        shell: '76rem',
        prose: '44rem',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 50px -25px rgba(0,0,0,0.9)',
        hud: '0 10px 30px -15px rgba(0,0,0,0.95)',
        beam: '0 0 40px -10px rgba(255,215,106,0.45)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
        // Sehr langsames Driften des Sternenfelds im Hintergrund.
        drift: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-2%, -1.5%, 0)' },
        },
        // Laufendes Glanzlicht auf der Fortschrittsleiste.
        sheen: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out both',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        drift: 'drift 90s ease-in-out infinite alternate',
        sheen: 'sheen 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
