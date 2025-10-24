// @ts-check
import { defineConfig } from 'astro/config';

import db from '@astrojs/db';

import tailwind from '@astrojs/tailwind';

import netlify from '@astrojs/netlify';

import auth from 'auth-astro';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  integrations: [db(), tailwind(), auth(), icon()],
  adapter: netlify({
    edge: false, // ✅ critical for Astro DB + Auth to work reliably
  }),
  output: 'server',
});
