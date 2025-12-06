/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // Abilita la dark mode tramite classe (aggiungiamo/rimuoviamo la classe "dark" sull'elemento html)
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};
