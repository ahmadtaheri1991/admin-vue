<script setup>
import { useAppStore } from "@/stores/app";
import { areYouSure } from "@/utils/functions";
import { useMutation, useQuery } from "@tanstack/vue-query";
import axios from "@/axios";
import { required } from "@/utils/formRules";

const headers_product = [
  { title: "شناسه", key: "id" },
  { title: "نام", key: "name" },
  { title: "عملیات", key: "actions", align: "center", sortable: false },
];

const appStore = useAppStore();

const {
  data: products,
  refetch: refetch_products,
  isPending: isLoading_products,
} = useQuery({
  queryKey: ["weights"],
  queryFn: () => axios.get("weights"),
});

const { mutate: createWeight, isPending: isLoading_createWeight } = useMutation(
  {
    mutationFn: (body) => axios.post("weights", body),
    onSuccess: () => {
      appStore.openAlert(0, "با موفقیت افزوده شد");
      refetch_products();
      dialog.close();
    },
    onError: (error) => {
      console.log(error);
      const { data } = error.response;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
    },
  }
);

const { mutate: updateWeight, isPending: isLoading_updateWeight } = useMutation(
  {
    mutationFn: ({ id, body }) => axios.patch(`weights/${id}`, body),
    onSuccess: () => {
      appStore.openAlert(0, "با موفقیت ویرایش شد");
      refetch_products();
      dialog.close();
    },
    onError: (error) => {
      console.log(error);
      const { data } = error.response;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
    },
  }
);

const { mutate: deleteWeight, isPending: isLoading_deleteWeight } = useMutation(
  {
    mutationFn: (id) => axios.delete(`weights/${id}`),
    onSuccess: () => {
      appStore.openAlert(0, "حذف با موفقیت انجام شد");
      refetch_products();
    },
    onError: (error) => {
      console.log(error);
      const { data } = error.response;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
    },
  }
);

const deletingItemId = ref(0);

const dialog = reactive({
  canBeShown: false,
  item: null,
  formRef: null,
  submitLoading: false,
  form: { name: "" },
  async open(item) {
    this.canBeShown = true;
    this.item = null;
    await nextTick();
    this.formRef?.reset();
    if (item) {
      this.item = item;
      this.form.name = item.name;
    }
  },
  close() {
    this.canBeShown = false;
  },
  add() {
    const body = { name: this.form.name };
    createWeight(body);
  },
  async update() {
    const body = { name: this.form.name };
    updateWeight({ id: this.item.id, body });
  },
});

async function deleteItem(item) {
  const { isConfirmed } = await areYouSure();
  if (!isConfirmed) return;

  deletingItemId.value = item.id;
  deleteWeight(item.id);
}
</script>

<template>
  <v-btn
    class="mb-3"
    text="افزودن بسته‌بندی"
    color="primary"
    @click="dialog.open()"
  />

  <v-data-table
    class="border"
    :headers="headers_product"
    :items="products"
    :items-per-page="10"
    :loading="isLoading_products"
  >
    <template #item.actions="{ item }">
      <div class="d-flex justify-center">
        <v-btn
          icon="mdi-pencil"
          variant="text"
          rounded="full"
          class="fs-14"
          color="warning"
          @click="dialog.open(item)"
        />

        <v-btn
          icon="mdi-delete"
          variant="text"
          rounded="full"
          class="fs-14"
          color="error"
          :loading="isLoading_deleteWeight && deletingItemId == item.id"
          @click="deleteItem(item)"
        />
      </div>
    </template>
  </v-data-table>

  <v-dialog max-width="500" v-model="dialog.canBeShown">
    <v-card>
      <custom-form
        v-model="dialog.formRef"
        @valid="dialog.item ? dialog.update() : dialog.add()"
      >
        <v-card-title>{{
          dialog.item ? "ویرایش بسته‌بندی" : "افزودن بسته‌بندی"
        }}</v-card-title>

        <!-- <v-divider class="border-opacity-25" color="black" /> -->

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="dialog.form.name"
                label="نام بسته‌بندی"
                variant="outlined"
                :rules="[required]"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <!-- <v-divider class="border-opacity-25" color="black" /> -->

        <div
          style="height: 72px"
          class="d-flex px-6 py-4 flex-wrap align-center"
        >
          <v-spacer />

          <v-cancel-btn @click="dialog.close()" />

          <v-btn
            height="40"
            class="mr-2"
            type="submit"
            min-width="80"
            color="primary"
            :text="dialog.item ? 'ویرایش' : 'افزودن'"
            :loading="isLoading_createWeight || isLoading_updateWeight"
          />
        </div>
      </custom-form>
    </v-card>
  </v-dialog>
</template>
