<script setup>
import DefaultLayout from "@/layouts/default.vue";

const route = useRoute();

const isShowDefaultLayout = computed(() => {
  return route.name ? !route.name.includes("login") : false;
});
</script>

<template>
  <DefaultLayout v-if="isShowDefaultLayout" />

  <router-view v-else />
</template>
