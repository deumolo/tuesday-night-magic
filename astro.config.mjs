// @ts-check
import { defineConfig } from 'astro/config';

import db from '@astrojs/db';

import tailwind from '@astrojs/tailwind';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  integrations: [db(), tailwind()],
  adapter: netlify()
});