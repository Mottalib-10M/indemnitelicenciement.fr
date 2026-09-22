import { defineConfig } from 'astro/config';
import trustKit from './src/integrations/trust-kit.mjs';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  trailingSlash: 'always',
  site: 'https://indemnitelicenciement.fr',

  /*
   * Pages consolidees le 2026-09-22.
   *
   * Huit pages par niveau de salaire (identiques a 98,9 %) et onze
   * anciennetes intermediaires (95,7 %). L'accueil porte le calculateur et
   * le tableau qui donnent la reponse pour n'importe quelle valeur, ce
   * qu'aucune de ces pages ne faisait mieux.
   */
  redirects: {
    '/indemnite-licenciement-1802-euros/': '/',
    '/indemnite-licenciement-2000-euros/': '/',
    '/indemnite-licenciement-2500-euros/': '/',
    '/indemnite-licenciement-3000-euros/': '/',
    '/indemnite-licenciement-3500-euros/': '/',
    '/indemnite-licenciement-4000-euros/': '/',
    '/indemnite-licenciement-5000-euros/': '/',
    '/indemnite-licenciement-6000-euros/': '/',
    '/indemnite-licenciement-2-ans/': '/',
    '/indemnite-licenciement-3-ans/': '/',
    '/indemnite-licenciement-4-ans/': '/',
    '/indemnite-licenciement-6-ans/': '/',
    '/indemnite-licenciement-7-ans/': '/',
    '/indemnite-licenciement-8-ans/': '/',
    '/indemnite-licenciement-9-ans/': '/',
    '/indemnite-licenciement-12-ans/': '/',
    '/indemnite-licenciement-18-ans/': '/',
    '/indemnite-licenciement-22-ans/': '/',
    '/indemnite-licenciement-28-ans/': '/',
  },

  integrations: [
    trustKit({ lang: 'fr', siteUrl: 'https://indemnitelicenciement.fr', siteName: 'Indemnité Licenciement', founded: '2026-06-27', about: '/a-propos/', method: '/methodologie/' }), react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
