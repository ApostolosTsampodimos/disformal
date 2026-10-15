import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { MISSION_URL } from './site.config.mjs';

export default defineConfig({
  site: MISSION_URL,
  integrations: [sitemap()],
  build: { inlineStylesheets: 'always' },
});
