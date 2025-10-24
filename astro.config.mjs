// @ts-check
import { defineConfig } from 'astro/config';
import db from '@astrojs/db';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import netlify from '@astrojs/netlify';
import auth from 'auth-astro';
import icon from 'astro-icon';

// Use different adapters for development vs production
const isDev = process.env.NODE_ENV === 'development' || !process.env.NETLIFY;
const adapter = isDev ? node({ mode: 'standalone' }) : netlify();

// https://astro.build/config
export default defineConfig({
  integrations: [db(), tailwind(), auth(), icon()],
  adapter: adapter,
  output: 'server',
});
