import { fileURLToPath, URL } from "node:url";
import VueRouter from "unplugin-vue-router/vite";
import AutoImport from "unplugin-auto-import/vite";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
      /* options */
    }),
    vue(),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "pinia",
        {
          "@tanstack/vue-query": ["useQuery", "useMutation"],
        },
        // {
        //   "pinia-plugin-persistedstate": [
        //     ["default", "piniaPluginPersistedstate "],
        //   ],
        // },
      ],
      dirs: ["./src/stores", "./src/components"],
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
