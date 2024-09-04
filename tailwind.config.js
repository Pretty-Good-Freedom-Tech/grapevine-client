/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
        {
        grapevine: {
          ...require("daisyui/src/theming/themes")["forest"],
          info: "#c084fc",
          success: "#e879f9",
          warning : "#f472b6",
          error : "#fb7185"
        }
      }
    ],
  },
}

