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
          info: "#a855f7",
          success: "#d946ef",
          warning : "#ec4899",
          error : "#f43f5e"
        }
      }
    ],
  },
}

