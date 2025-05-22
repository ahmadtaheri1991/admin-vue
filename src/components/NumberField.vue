<script setup>
import { toPersianDigit } from "@/utils/functions";
import { computed } from "vue";

defineOptions({
  inheritAttrs: true,
});

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const displayValue = computed({
  get: () =>
    props.modelValue ? toPersianDigit(props.modelValue.toString()) : "",
  set: (value) => {
    const englishValue = value?.replace(/[۰-۹]/g, (d) =>
      "۰۱۲۳۴۵۶۷۸۹".indexOf(d)
    );
    emit("update:modelValue", englishValue);
  },
});

const onlyNumber = ($event) => {
  let keyCode = $event.keyCode ? $event.keyCode : $event.which;
  if (keyCode < 48 || keyCode > 57) {
    $event.preventDefault();
  }
};
</script>

<template>
  <v-text-field
    v-bind="$attrs"
    dir="auto"
    v-model="displayValue"
    :label="label"
    inputMode="numeric"
    :rules="rules"
    @keypress="onlyNumber"
  />
</template>
