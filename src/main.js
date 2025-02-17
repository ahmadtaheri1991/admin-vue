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
  aliases: {
    VCancelBtn: components.VBtn,
  },
  defaults: {
    global: {
      hideDetails: "auto",
    },
    VTextField: {
      rounded: "12",
      variant: "outlined",
      flat: true,
    },
    VFileInput: {
      rounded: "12",
      variant: "outlined",
      flat: true,
    },
    VTextarea: {
      rounded: "12",
      variant: "outlined",
      flat: true,
    },
    VCancelBtn: {
      rounded: "12",
      height: 40,
      minWidth: 80,
      text: "لغو",
      color: "error",
      variant: "tonal",
    },
    VBtn: {
      color: "primary",
      flat: true,
      rounded: "12",
    },
    VDataTable: {
      class: "rounded-14 pa-4",
      VBtn: {
        flat: true,
        size: "small",
        rounded: "8",
      },
    },
    VCard: {
      rounded: "14",
      VCardTitle: {
        style: {
          color: "#11181C",
        },
        class: "py-4 px-6 fs-18 height-60",
      },
      VCardText: {
        class: "py-2 px-6",
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
