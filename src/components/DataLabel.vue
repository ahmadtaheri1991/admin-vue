<script setup>
defineProps(["title", "value"]);
</script>

<template>
  <div>
    <span class="fw-600" v-if="title">{{ title + " : " }}</span>

    <span class="fs-14">
      <slot>{{ value }}</slot>
    </span>
  </div>
</template>
