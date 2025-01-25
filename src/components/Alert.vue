<script setup>
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();
</script>

<template>
  <v-snackbar
    v-model="appStore.alert.canBeShown"
    :color="appStore.alert.color"
    location="bottom left"
    timeout="4000"
  >
    <span class="text-white">{{ appStore.alert.text }}</span>
    <template #actions>
      <v-btn icon="mdi-close" color="white" @click="appStore.closeAlert" />
    </template>
  </v-snackbar>
</template>

<style>
.v-snackbar__wrapper {
  width: 95vw !important;
  max-width: 400px !important;
}
</style>
