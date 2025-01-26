<script setup>
import { useDisplay } from "vuetify";

const { xs } = useDisplay();
const drawer = ref(false);

onMounted(() => {
  if (!xs.value) drawer.value = true;
});
</script>

<template>
  <v-app>
    <v-layout>
      <v-app-bar elevation="1" v-if="xs">
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" />
      </v-app-bar>

      <v-navigation-drawer
        :temporary="xs"
        v-model="drawer"
        color="#445760"
        class=""
      >
        <!-- <v-list-item link to="/dashboard" title="داشبورد" /> -->
        <v-list-item link to="/categories" title="دسته‌بندی‌ها" />
        <v-list-item link to="/weights" title="بسته‌بندی‌ها" />
        <v-list-item link to="/products" title="محصولات" />
        <v-list-item link to="/productModels" title="مدل محصولات" />
        <v-list-item link to="/orders" title="سفارشات" />
        <!-- <v-list-item link to="/orders" title="در حال اتمام" /> -->
        <!-- <v-list-item link to="/orders" title="گزارش فروش" /> -->
      </v-navigation-drawer>

      <v-main>
        <v-container>
          <router-view />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>

  <alert />
</template>
