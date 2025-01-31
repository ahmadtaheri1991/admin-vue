<script setup>
import { useAppStore } from "@/stores/app";
import {
  areYouSure,
  numberWithCommas,
  toPersianNumber,
} from "@/utils/functions";
import axios from "@/axios";

const headers_productModel = [
  { title: "شناسه", key: "id" },
  { title: "دسته‌بندی", key: "category" },
  { title: "محصول", key: "product" },
  { title: "بسته‌بندی", key: "weight" },
  { title: "قیمت", key: "price" },
  { title: "موجودی", key: "inventory" },
  { title: "عملیات", key: "actions", align: "center", sortable: false },
];

const appStore = useAppStore();

const {
  data: productModels,
  refetch: refetch_productModels,
  isPending: isLoading_productModels,
} = useQuery({
  queryKey: ["productModels"],
  queryFn: () => axios.get("productModels"),
});

const { data: categories } = useQuery({
  queryKey: ["categories"],
  queryFn: () => axios.get("categories"),
  select: (items) => items.map((x) => ({ value: x.id, title: x.name })),
});

const { data: products } = useQuery({
  queryKey: ["products"],
  queryFn: () => axios.get("products"),
  select: (items) => items.map((x) => ({ ...x, value: x.id, title: x.name })),
});

const { data: weights } = useQuery({
  queryKey: ["weights"],
  queryFn: () => axios.get("weights"),
  select: (items) => items.map((x) => ({ value: x.id, title: x.name })),
});

const { mutate: createProductModel, isPending: isLoading_createProductModel } =
  useMutation({
    mutationFn: (body) => axios.post("productModels", body),
    onSuccess: () => {
      appStore.openAlert(0, "با موفقیت افزوده شد");
      refetch_productModels();
      dialog.close();
    },
    onError: (error) => {
      console.log(error);
      const { data } = error.response;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
    },
  });

const { mutate: updateProductModel, isPending: isLoading_updateProductModel } =
  useMutation({
    mutationFn: (id, body) => axios.patch(`productModels/${id}`, body),
    onSuccess: () => {
      appStore.openAlert(0, "با موفقیت ویرایش شد");
      refetch_productModels();
      dialog.close();
    },
    onError: (error) => {
      console.log(error);
      const { data } = error.response;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
    },
  });

const { mutate: deleteProductModel, isPending: isLoading_deleteProductModel } =
  useMutation({
    mutationFn: (id) => axios.delete(`productModels/${id}`),
    onSuccess: () => {
      appStore.openAlert(0, "حذف با موفقیت انجام شد");
      refetch_productModels();
    },
    onError: (error) => {
      console.log(error);
      const { data } = error.response;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
    },
  });

const deletingItemId = ref(0);

const dialog = reactive({
  canBeShown: false,
  item: null,
  formRef: null,
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
  add() {
    const body = {
      categoryId: this.form.category,
      productId: this.form.product,
      weightId: this.form.weight,
      price: this.form.price,
      inventory: this.form.inventory,
    };
    createProductModel(body);
  },
  update() {
    const body = {
      categoryId: this.form.category,
      productId: this.form.product,
      weightId: this.form.weight,
      price: numberWithoutCommas(toEnglishNumber(this.form.price)),
      inventory: numberWithoutCommas(toEnglishNumber(this.form.inventory)),
    };
    updateProductModel(this.item.id, body);
  },
});

async function deleteItem(item) {
  const { isConfirmed } = await areYouSure();
  if (!isConfirmed) return;

  deletingItemId.value = item.id;
  deleteProductModel(item.id);
}

watch(
  () => dialog.form.category,
  (value) => {
    let { product } = dialog.form;
    const { categoryId } = products.value.find((x) => x.value == product) || {};
    if (categoryId != value) dialog.form.product = null;
  }
);

watch(
  () => dialog.form.product,
  (value) => {
    if (!value) return;

    const { categoryId } = products.value.find((x) => x.value == value);
    dialog.form.category = categories.value.find(
      (x) => x.value == categoryId
    ).value;
  }
);

const filteredProducts = computed(() => {
  const { category } = dialog.form;
  if (!category) return products.value;
  return products.value?.filter((x) => x.categoryId == category);
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
    :headers="headers_productModel"
    :items="productModels"
    :items-per-page="10"
    :loading="isLoading_productModels"
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
              :loading="
                isLoading_deleteProductModel && deletingItemId == item.id
              "
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
            :loading="
              isLoading_createProductModel || isLoading_updateProductModel
            "
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
