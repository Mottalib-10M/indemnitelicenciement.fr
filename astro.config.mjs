import { defineConfig } from 'astro/config';
import trustKit from './src/integrations/trust-kit.mjs';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  trailingSlash: 'always',  site: 'https://indemnite-licenciement.fr',
  integrations: [
    trustKit({ lang: 'fr', siteUrl: 'https://indemnite-licenciement.fr', siteName: 'Indemnité Licenciement', founded: '2026-06-27', about: '/a-propos/', method: '/methodologie/' }), react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
