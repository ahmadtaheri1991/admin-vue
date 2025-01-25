<script setup>
const props = defineProps(["modelValue"]);
const emit = defineEmits(["valid", "update:modelValue"]);
const formRef = ref(null);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

onMounted(() => {
  model.value = formRef.value;
});

async function submit() {
  try {
    await validateForm(formRef.value);
    emit("valid");
  } catch (error) {
    console.log(error);
  }
}
</script>

<template>
  <v-form ref="formRef" @submit.prevent="submit" class="w-100">
    <slot />
  </v-form>
</template>
