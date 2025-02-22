<script setup>
import { useAuthStore } from "@/stores/auth";
import { areYouSure } from "@/utils/functions";
import { useDisplay } from "vuetify";

const { xs } = useDisplay();
const drawer = ref(false);

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  if (!xs.value) drawer.value = true;
});

async function showSwal() {
  const { isConfirmed } = await areYouSure();
  if (!isConfirmed) return;

  authStore.unsetTokens();
  router.push("/login");
}
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
        <v-list-item link to="/productModels" title="بسته‌بندی محصولات" />
        <v-list-item link to="/orders" title="سفارشات" />
        <v-list-item link to="/rejectedOrders" title="سفارشات ردشده" />
        <!-- <v-list-item link to="/orders" title="گزارش فروش" /> -->
        <v-list-item @click="showSwal()" title="خروج" />
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
