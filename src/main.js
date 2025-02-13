import "./assets/css/main.scss";
import router from "./router";
import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { VueQueryPlugin } from "@tanstack/vue-query";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css"; // Ensure you are using css-loader

import App from "./App.vue";

const vuetify = createVuetify({
  theme: {
    // defaultTheme: "dark",
    // themes: {
    //   customDarkTheme,
    // },
  },
  locale: {
    locale: "fa",
  },
  defaults: {
    global: {
      hideDetails: "auto",
    },
    VTextField: {
      variant: "outlined",
    },
    VBtn: {
      color: "primary",
    },
    VDataTable: {
      hover: true,

      VBtn: {
        flat: true,
        size: "small",
      },
    },
  },
  components,
  directives,
});

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(pinia);
app.use(vuetify);
app.use(router);
app.use(VueQueryPlugin);

app.mount("#app");
