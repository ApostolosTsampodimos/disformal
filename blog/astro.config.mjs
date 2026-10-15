import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { BLOG_URL } from './site.config.mjs';

export default defineConfig({
  site: BLOG_URL,
  integrations: [sitemap()],
  build: { inlineStylesheets: 'always' },
});
