/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fondo': '#0D1117',
        'primario': '#161B22',
        'borde': '#30363D',
        'texto-principal': '#C9D1D9',
        'texto-secundario': '#8B949E',
        'acento-1': '#58A6FF',
        'acento-2': '#E9A8F9',
      }
    },
  },
  plugins: [],
}
