<script setup>
import { useAppStore } from "@/stores/app";
import { areYouSure, toPersianDigit } from "@/utils/functions";
import { useMutation, useQuery } from "@tanstack/vue-query";
import axios from "@/axios";
import { required } from "@/utils/formRules";
import { reactive } from "vue";

const weight = reactive({
  headers: [
    { title: "", key: "row", sortable: false },
    { title: "نام", key: "name" },
    { title: "عملیات", key: "actions", align: "center", sortable: false },
  ],
  page: 1,
  itemsPerPage: 10,
});

const appStore = useAppStore();

const {
  data: weights,
  refetch: refetch_weights,
  isPending: isLoading_weights,
} = useQuery({
  queryKey: ["weights"],
  queryFn: () => axios.get("weights"),
});

const { mutate: createWeight, isPending: isLoading_createWeight } = useMutation(
  {
    mutationFn: (body) => axios.post("weights", body),
    onSuccess: () => {
      appStore.openAlert(0, "با موفقیت افزوده شد");
      refetch_weights();
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
      refetch_weights();
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
      refetch_weights();
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
    :headers="weight.headers"
    :items="weights"
    :page="weight.page"
    :items-per-page="weight.itemsPerPage"
    :page-text="`صفحه ${toPersianDigit(weight.page)} از ${toPersianDigit(
      Math.ceil(weights?.length / weight.itemsPerPage)
    )}`"
    :loading="isLoading_weights"
    :hide-default-footer="!weights?.length || isLoading_weights"
  >
    <template #item.row="{ index }">{{ toPersianDigit(index + 1) }}</template>

    <template #item.actions="{ item }">
      <div class="d-flex justify-center">
        <v-edit-btn @click="dialog.open(item)" />

        <v-delete-btn
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

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="dialog.form.name"
                label="نام بسته‌بندی"
                :rules="[required]"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <div
          style="height: 72px"
          class="d-flex px-6 py-4 flex-wrap align-center"
        >
          <v-spacer />

          <v-cancel-btn @click="dialog.close()" />

          <v-submit-btn
            type="submit"
            :text="dialog.item ? 'ویرایش' : 'افزودن'"
            :loading="isLoading_createWeight || isLoading_updateWeight"
          />
        </div>
      </custom-form>
    </v-card>
  </v-dialog>
</template>
