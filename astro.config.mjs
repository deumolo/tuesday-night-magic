// @ts-check
import { defineConfig } from 'astro/config';
import db from '@astrojs/db';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import auth from 'auth-astro';
import icon from 'astro-icon';


export default defineConfig({
  integrations: [db(), tailwind(), auth(), icon()],
  adapter: node({
    mode: 'standalone'
  }),
  output: 'server',
});
