import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { MAIN_URL } from './site.config.mjs';

export default defineConfig({
  site: MAIN_URL,
  integrations: [sitemap()],
  build: { inlineStylesheets: 'always' },
});
