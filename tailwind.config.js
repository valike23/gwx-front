/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    extend: {
      width: {
        a4: "210mm",
      },
      height: {
        a4: "297mm"
      },
      screens: {
        'xs': '480px',
      },
      fontSize: {
        '2xs': '10px'
      },
      colors: {
        primary: {
          DEFAULT: "#F08829",
          "50":"#ffffff","100":"#fdf2e8","200":"#fbddc2","300":"#f8c89b","400":"#f5b275","500":"#f39d4f","600":"#F08829", "700":"#F08829", "800":"#F08829", "900":"#F08829"},
        'sbg': 'var(--scaffold-background-color)',
      }
    },
  },
  plugins: [
    require("daisyui"),
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/typography'),
    require('flowbite/plugin')
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["[data-theme=light]"],
          "primary": "#F08829",
          // "primary-focus": "#784415",
          "primary-content": "#FFFFFF",
          "secondary": "#784415",
          "accent": "#16A4A6",
          "--btn-text-case": "none",
          "--btn-focus-scale": "0.98",
          "--rounded-btn": "0.35rem",
          "--rounded-box": "0.3rem",
          "--animation-btn": "0.05s",
          "--animation-input": ".2s",

          "--scaffold-background-color": "#fdfdfd",
          "--input-border-color": "#F08829",
        }
      }
    ]
  }
}

