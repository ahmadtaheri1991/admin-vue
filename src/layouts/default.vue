<script setup>
import { useAuthStore } from "@/stores/auth";
import { areYouSure } from "@/utils/functions";
import { useDisplay } from "vuetify";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const { xs } = useDisplay();
const drawer = ref(true); // مدیریت وضعیت باز و بسته شدن navigation drawer
const isOrdersOpen = ref(false); // مدیریت وضعیت باز و بسته شدن منوی سفارشات

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

      <v-navigation-drawer :temporary="xs" v-model="drawer" color="#445760">
        <v-list>
          <v-list-item link to="/categories" title="دسته‌بندی‌ها" />
          <v-list-item link to="/weights" title="بسته‌بندی‌ها" />
          <v-list-item link to="/products" title="محصولات" />
          <v-list-item link to="/productModels" title="بسته‌بندی محصولات" />

          <!-- منوی تو در تو برای سفارشات -->
          <v-list-group v-model="isOrdersOpen">
            <template #activator="{ props }">
              <v-list-item v-bind="props" title="سفارشات" />
            </template>

            <v-list-item
              link
              to="/orders/pending"
              title="در انتظار"
              value="pending"
            />
            <v-list-item
              link
              to="/orders/confirmed"
              title="تاییدشده"
              value="confirmed"
            />
            <v-list-item
              link
              to="/orders/shipped"
              title="ارسال شده"
              value="shipped"
            />
            <v-list-item
              link
              to="/orders/rejected"
              title="ردشده"
              value="rejected"
            />
          </v-list-group>

          <v-list-item @click="showSwal" title="خروج" />
        </v-list>
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
