<script setup>
import { useAppStore } from "@/stores/app";
import { numberWithoutCommas } from "~/utils/functions";

const {
  public: { apiBase, urlBase },
} = useRuntimeConfig();

const { $swal } = useNuxtApp();
const appStore = useAppStore();
const table = reactive({
  headers: [
    { title: "شناسه", key: "id" },
    { title: "دسته‌بندی", key: "category" },
    { title: "محصول", key: "product" },
    { title: "بسته‌بندی", key: "weight" },
    { title: "قیمت", key: "price" },
    { title: "موجودی", key: "inventory" },
    { title: "عملیات", key: "actions", align: "center", sortable: false },
  ],
  items: [],
  loading: false,
  itemsPerPage: 10,
  refresh: null,
});

const dialog = reactive({
  canBeShown: false,
  item: null,
  formRef: null,
  submitLoading: false,
  form: {
    category: null,
    product: null,
    weight: null,
    price: "",
    inventory: "",
  },
  async open(item) {
    this.canBeShown = true;
    this.item = null;
    await nextTick();
    this.formRef?.reset();
    if (item) {
      this.item = item;
      this.form.category = item.categoryId;
      this.form.product = item.productId;
      this.form.weight = item.weightId;
      this.form.price = item.price;
      this.form.inventory = item.inventory;
    }
  },
  close() {
    this.canBeShown = false;
  },
  async add() {
    this.submitLoading = true;
    const { error } = await useFetch(`${apiBase}/productModels/create`, {
      method: "post",
      body: {
        categoryId: this.form.category,
        productId: this.form.product,
        weightId: this.form.weight,
        price: this.form.price,
        inventory: this.form.inventory,
      },
    });
    this.submitLoading = false;

    if (error.value) {
      const { data } = error.value;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
      return;
    }

    appStore.openAlert(0, "با موفقیت افزوده شد");
    table.refresh();
    this.close();
  },
  async update() {
    this.submitLoading = true;
    const { error } = await useFetch(
      `${apiBase}/productModels/${this.item.id}`,
      {
        method: "patch",
        body: {
          categoryId: this.form.category,
          productId: this.form.product,
          weightId: this.form.weight,
          price: numberWithoutCommas(toEnglishNumber(this.form.price)),
          inventory: numberWithoutCommas(toEnglishNumber(this.form.inventory)),
        },
      }
    );
    this.submitLoading = false;

    if (error.value) {
      appStore.openAlert(2, "عملیات با خطا مواجه شد");
      return;
    }

    appStore.openAlert(0, "با موفقیت ویرایش شد");
    table.refresh();
    this.close();
  },
});

const { error } = ({
  data: table.items,
  pending: table.loading,
  refresh: table.refresh,
} = await useFetch(`${apiBase}/productModels`));

if (error.value) table.items = [];
else {
  table.items.forEach(x => {
    x.deleteLoading = false;
  });
}

const { data: categories = [] } = await useFetch(`${apiBase}/categories`, {
  transform: items => items.map(x => ({ value: x.id, title: x.name })),
});

const { data: products = [] } = await useFetch(`${apiBase}/products`, {
  transform: items => items.map(x => ({ ...x, value: x.id, title: x.name })),
});

const { data: weights = [] } = await useFetch(`${apiBase}/weights`, {
  transform: items => items.map(x => ({ value: x.id, title: x.name })),
});

async function deleteItem(item) {
  const { isConfirmed } = await $swal.fire({
    icon: "question",
    text: "آیا مطمئن هستید؟",
    confirmButtonText: "بله",
    showCancelButton: true,
    cancelButtonText: "خیر",
  });
  if (!isConfirmed) return;

  item.deleteLoading = true;
  const { error } = await useFetch(
    `${apiBase}/productModels/delete/${item.id}`,
    {
      method: "delete",
    }
  );
  item.deleteLoading = false;

  if (error.value) {
    appStore.openAlert(2, "عملیات با خطا مواجه شد");
    return;
  }

  appStore.openAlert(0, "حذف با موفقیت انجام شد");
  table.refresh();
}

watch(
  () => dialog.form.category,
  value => {
    let { product } = dialog.form;
    const { categoryId } = products.value.find(x => x.value == product) || {};
    if (categoryId != value) dialog.form.product = null;
  }
);

watch(
  () => dialog.form.product,
  value => {
    if (!value) return;

    const { categoryId } = products.value.find(x => x.value == value);
    dialog.form.category = categories.value.find(
      x => x.value == categoryId
    ).value;
  }
);

const filteredProducts = computed(() => {
  const { category } = dialog.form;
  if (!category) return products.value;
  return products.value?.filter(x => x.categoryId == category);
});
</script>

<template>
  <v-btn
    class="mb-3"
    color="primary"
    text="افزودن مدل محصول"
    @click="dialog.open()"
  />

  <v-data-table
    class="border"
    :headers="table.headers"
    :items="table.items"
    :items-per-page="table.itemsPerPage"
    :loading="table.loading"
  >
    <template #item="{ item }">
      <tr :class="{ 'bg-red-lighten-4': item.inventory < 10 }">
        <td>{{ item.id }}</td>
        <td>{{ item.category.name }}</td>
        <td>{{ item.product.name }}</td>
        <td>{{ item.weight.name }}</td>
        <td>{{ toPersianNumber(numberWithCommas(item.price)) }}</td>
        <td>{{ toPersianNumber(item.inventory) }}</td>
        <td>
          <div class="d-flex justify-center">
            <v-btn
              class="mx-1"
              text="ویرایش"
              color="warning"
              @click="dialog.open(item)"
            />
            <v-btn
              class="mx-1"
              text="حذف"
              color="error"
              :loading="item.deleteLoading"
              @click="deleteItem(item)"
            />
          </div>
        </td>
      </tr>
    </template>
  </v-data-table>

  <v-dialog max-width="900" v-model="dialog.canBeShown">
    <v-card>
      <custom-form
        v-model="dialog.formRef"
        @valid="dialog.item ? dialog.update() : dialog.add()"
      >
        <v-card-title style="height: 50px" class="bg-grey-lighten-3">{{
          dialog.item ? "ویرایش مدل محصول" : "افزودن مدل محصول"
        }}</v-card-title>

        <v-divider class="border-opacity-25" color="black" />

        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-select
                :disabled="dialog.item"
                v-model="dialog.form.category"
                :items="categories"
                label="دسته بندی"
                variant="outlined"
                :rules="[required]"
                clearable
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-select
                :disabled="dialog.item"
                v-model="dialog.form.product"
                :items="filteredProducts"
                label="محصول"
                variant="outlined"
                :rules="[required]"
                clearable
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-select
                :disabled="dialog.item"
                v-model="dialog.form.weight"
                :items="weights"
                label="بسته‌بندی"
                variant="outlined"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-persian-digit
                v-model="dialog.form.price"
                label="قیمت"
                variant="outlined"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-persian-digit
                v-model="dialog.form.inventory"
                label="موجودی"
                variant="outlined"
                :rules="[required]"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider class="border-opacity-25" color="black" />

        <div
          style="height: 50px"
          class="d-flex px-4 py-2 flex-wrap align-center bg-grey-lighten-4"
        >
          <v-spacer />

          <v-btn
            class="ml-2"
            type="submit"
            min-width="100"
            color="primary"
            :text="dialog.item ? 'ویرایش' : 'افزودن'"
            :loading="dialog.submitLoading"
          />

          <v-btn
            min-width="100"
            color="error"
            text="لغو"
            @click="dialog.close()"
          />
        </div>
      </custom-form>
    </v-card>
  </v-dialog>
</template>
