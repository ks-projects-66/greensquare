import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.greensquare.ai',
  integrations: [react(), mdx(), sitemap({ filter: (page) => !page.includes('/frame-storyboard/') })],
  redirects: {
    '/decision-frame': '/free',
    '/evidence': '/research',
    '/pricing': '/product#plans',
  },
});
