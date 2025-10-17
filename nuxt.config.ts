import { resolve } from 'path'

export default defineNuxtConfig({
  devtools: { enabled: true },
  // global CSS
  css: ['~/app/assets/css/main.css'],

  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:5000',
    },
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  alias: {
    '@': resolve(__dirname, './'),
    '~': resolve(__dirname, './'),
  },
})