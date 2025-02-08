<script setup>
import axios from "@/axios";
import { areYouSure } from "@/utils/functions";

const headers_category = [
  { title: "شناسه", key: "id" },
  { title: "نام", key: "name" },
  { title: "عملیات", key: "actions", align: "center", sortable: false },
];

const headers_product = [
  { title: "شناسه", key: "id" },
  { title: "نام", key: "name" },
  { title: "دسته‌بندی", key: "category" },
  { title: "عملیات", key: "actions", align: "center", sortable: false },
];

const appStore = useAppStore();
const showProduct = ref(false);

const {
  data: categories,
  refetch: refetch_categories,
  isPending: isLoading_categories,
} = useQuery({
  queryKey: ["categories"],
  queryFn: () => axios.get("categories"),
});

const {
  data: products,
  refetch: refetch_products,
  isPending: isLoading_products,
} = useQuery({
  queryKey: ["products"],
  queryFn: () => axios.get("products"),
});

const { mutate: createCategory, isPending: isLoading_createCategory } =
  useMutation({
    mutationFn: (body) =>
      axios.post("categories", body, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    onSuccess: () => {
      appStore.openAlert(0, "با موفقیت افزوده شد");
      refetch_categories();
      dialog.close();
    },
    onError: (error) => {
      console.log(error);
      const { data } = error.response;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
    },
  });

const { mutate: updateCategory, isPending: isLoading_updateCategory } =
  useMutation({
    mutationFn: (id, body) => axios.patch(`categories/${id}`, body),
    onSuccess: () => {
      appStore.openAlert(0, "با موفقیت ویرایش شد");
      refetch_categories();
      dialog.close();
    },
    onError: (error) => {
      console.log(error);
      const { data } = error.response;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
    },
  });

const { mutate: deleteCategory, isPending: isLoading_deleteCategory } =
  useMutation({
    mutationFn: (id) => axios.delete(`categories/${id}`),
    onSuccess: () => {
      appStore.openAlert(0, "حذف با موفقیت انجام شد");
      refetch_categories();
    },
    onError: (error) => {
      console.log(error);
      const { data } = error.response;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
    },
  });

const { mutate: createProduct, isPending: isLoading_createProduct } =
  useMutation({
    mutationFn: (body) => axios.post("products", body),
    onSuccess: () => {
      appStore.openAlert(0, "با موفقیت افزوده شد");
      productSection.formRef.reset();
      refetch_products();
    },
    onError: (error) => {
      console.log(error);
      const { data } = error.response;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
    },
  });

const { mutate: updateProduct, isPending: isLoading_updateProduct } =
  useMutation({
    mutationFn: (id, body) => axios.patch(`products/${id}`, body),
    onSuccess: () => {
      appStore.openAlert(0, "با موفقیت ویرایش شد");
      productSection.clear();
      refetch_products();
    },
    onError: (error) => {
      console.log(error);
      const { data } = error.response;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
    },
  });

const { mutate: deleteProduct, isPending: isLoading_deleteProduct } =
  useMutation({
    mutationFn: (id) => axios.delete(`products/${id}`),
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
  });

const deletingItemId = ref(0);

const dialog = reactive({
  canBeShown: false,
  item: null,
  formRef: null,
  form: {
    name: "",
    image: [],
  },
  async open(item) {
    this.canBeShown = true;
    this.item = null;
    await nextTick();
    this.formRef?.reset();
    this.form.image = [];
    if (item) {
      this.item = item;
      this.form.name = item.name;
    }
  },
  close() {
    this.canBeShown = false;
  },
  add() {
    const formData = new FormData();
    formData.append("name", this.form.name);
    formData.append("image", this.form.image);
    createCategory(formData);
  },
  update() {
    const formData = new FormData();
    formData.append("name", this.form.name);
    if (this.form.image.length) formData.append("image", this.form.image[0]);
    updateCategory(this.item.id, formData);
  },
});

const productSection = reactive({
  canBeShown: false,
  item: null,
  formRef: null,
  form: {
    name: "",
    category: null,
    coverImage: [],
    images: [],
    description: "",
  },
  async open(item) {
    this.canBeShown = true;
    this.item = null;
    await nextTick();
    this.formRef?.reset();
    this.form.coverImage = [];
    this.form.images = [];
    if (item) {
      this.item = item;
      this.form.name = item.name;
      this.form.category = item.categoryId;
      this.form.description = item.description;
    }
  },
  add() {
    const formData = new FormData();
    formData.append("name", this.form.name);
    formData.append("categoryId", selectedCat.value.id);
    formData.append("description", this.form.description);
    formData.append("image", this.form.coverImage[0]);
    this.form.images.forEach((image) => {
      formData.append("gallery", image);
    });

    createProduct(formData);
  },
  update() {
    const formData = new FormData();
    formData.append("name", this.form.name);
    formData.append("categoryId", this.form.category);
    formData.append("description", this.form.description);
    if (this.form.images.length) formData.append("gallery", this.form.images);
    if (this.form.coverImage.length)
      formData.append("image", this.form.coverImage[0]);

    updateProduct(this.item.id, formData);
  },
  clear() {
    this.item = null;
    this.formRef?.reset();
    this.form.coverImage = [];
    this.form.images = [];
  },
});

const selectedCat = ref(null);

async function deleteCategoryItem(item) {
  const { isConfirmed } = await areYouSure();
  if (!isConfirmed) return;

  deletingItemId.value = item.id;
  deleteCategory(item.id);
}

async function deleteProductItem(item) {
  const { isConfirmed } = await areYouSure();
  if (!isConfirmed) return;

  deletingItemId.value = item.id;
  deleteProduct(item.id);
}

function addProductHandler(item) {
  selectedCat.value = item;
  showProduct.value = true;
}
</script>

<template>
  <template v-if="!showProduct">
    <v-btn
      class="mb-3"
      text="افزودن دسته‌بندی"
      color="primary"
      @click="dialog.open()"
    />

    <v-data-table
      class="border"
      :headers="headers_category"
      :items="categories"
      :items-per-page="10"
      :loading="isLoading_categories"
    >
      <template #item.actions="{ item }">
        <div class="d-flex justify-center">
          <v-btn
            class="mx-1"
            text="افزودن محصول"
            color="primary"
            @click="addProductHandler(item)"
          />
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
            :loading="isLoading_deleteCategory && deletingItemId == item.id"
            @click="deleteCategoryItem(item)"
          />
        </div>
      </template>
    </v-data-table>
  </template>

  <template v-else>
    <div class="d-flex">
      <span>{{ selectedCat.name }}</span>

      <v-btn
        append-icon="mdi-keyboard-backspace"
        class="mb-3 mr-auto d-flex"
        text="بازگشت به دسته‌بندی‌ها"
        color="primary"
        @click="showProduct = false"
      />
    </div>

    <v-card class="mb-3">
      <custom-form
        v-model="productSection.formRef"
        @valid="
          productSection.item ? productSection.update() : productSection.add()
        "
      >
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                :disabled="productSection.item"
                v-model="productSection.form.name"
                label="نام محصول"
                variant="outlined"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-file-input
                v-model="productSection.form.coverImage"
                prepend-icon=""
                label="تصویر اصلی"
                variant="outlined"
                :rules="[productSection.item ? null : requiredArray]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-file-input
                v-model="productSection.form.images"
                prepend-icon=""
                label="تصاویر"
                variant="outlined"
                :rules="[productSection.item ? null : requiredArray]"
                multiple
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="productSection.form.description"
                label="توضیحات"
                variant="outlined"
                rows="2"
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
            :text="productSection.item ? 'ویرایش' : 'افزودن'"
            :loading="isLoading_createProduct || isLoading_updateProduct"
          />

          <v-btn
            min-width="100"
            color="error"
            text="لغو"
            @click="productSection.clear()"
          />
        </div>
      </custom-form>
    </v-card>

    <v-data-table
      class="border"
      :headers="headers_product"
      :items="products?.filter((x) => x.categoryId == selectedCat.id)"
      :items-per-page="10"
      :loading="isLoading_products"
    >
      <template #item.category="{ item }">
        {{ item.category.name }}
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-center">
          <v-btn
            class="mx-1"
            text="ویرایش"
            color="warning"
            @click="productSection.open(item)"
          />
          <v-btn
            class="mx-1"
            text="حذف"
            color="error"
            :loading="isLoading_deleteProduct && deletingItemId == item.id"
            @click="deleteProductItem(item)"
          />
        </div>
      </template>
    </v-data-table>
  </template>

  <v-dialog max-width="500" v-model="dialog.canBeShown">
    <v-card>
      <custom-form
        v-model="dialog.formRef"
        @valid="dialog.item ? dialog.update() : dialog.add()"
      >
        <v-card-title style="height: 50px" class="bg-grey-lighten-3">{{
          dialog.item ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"
        }}</v-card-title>

        <v-divider class="border-opacity-25" color="black" />

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                :disabled="dialog.item"
                v-model="dialog.form.name"
                label="نام دسته‌بندی"
                variant="outlined"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12">
              <v-file-input
                v-model="dialog.form.image"
                prepend-icon=""
                label="تصویر"
                variant="outlined"
                :rules="[dialog.item ? null : requiredArray]"
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
            :loading="isLoading_createCategory || isLoading_updateCategory"
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
