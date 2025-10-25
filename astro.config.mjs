// @ts-check
import { defineConfig } from "astro/config";
import db from "@astrojs/db";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";
import netlify from "@astrojs/netlify";
import auth from "auth-astro";
import icon from "astro-icon";

// Use different adapters for development vs production
// Check if we're building for Netlify specifically
const isNetlifyBuild =
  process.env.NODE_ENV === "production" &&
  (process.env.NETLIFY || process.env.CONTEXT);
const adapter = isNetlifyBuild
  ? netlify({ edgeMiddleware: false })
  : node({ mode: "standalone" });

// https://astro.build/config
export default defineConfig({
  integrations: [db(), tailwind(), auth(), icon()],
  adapter: adapter,
  output: "server",
});
