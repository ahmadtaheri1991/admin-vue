<script setup></script>

<template>
  <v-app>
    <v-layout>
      <v-main>
        <v-container>
          <slot />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>

  <alert />
</template>
