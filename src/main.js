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
    VDeleteBtn: components.VBtn,
    VEditBtn: components.VBtn,
    VSubmitBtn: components.VBtn,
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
    VDeleteBtn: {
      icon: "mdi-delete",
      size: "x-small",
      variant: "text",
      rounded: "full",
      color: "error",
      class: "fs-14",
    },
    VEditBtn: {
      icon: "mdi-pencil",
      size: "x-small",
      variant: "text",
      rounded: "full",
      color: "warning",
      class: "fs-14",
    },
    VSubmitBtn: {
      rounded: "12",
      flat: true,
      height: "40",
      class: "mr-2",
      type: "submit",
      minWidth: "80",
      color: "primary",
    },
    VBtn: {
      color: "primary",
      flat: true,
      rounded: "12",
    },
    VDataTable: {
      class: "rounded-14 pa-4 border",
      itemsPerPageText: "تعداد در صفحه",
      itemsPerPageOptions: [
        { value: 10, title: "۱۰" },
        { value: 25, title: "۲۵" },
        { value: 50, title: "۵۰" },
        { value: 100, title: "۱۰۰" },
        { value: -1, title: "همه" },
      ],
      noDataText: "داده‌ای یافت نشد!",
      loadingText: "در حال بارگذاری داده‌ها ...",
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
        class: "pa-4",
      },
    },
    VDialog: {
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
    VSelect: {
      variant: "outlined",
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
