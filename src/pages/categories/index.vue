<script setup>
import axios from "@/axios";
import { areYouSure, toPersianDigit } from "@/utils/functions";
import { required, requiredArray } from "@/utils/formRules";
import { reactive } from "vue";

const category = reactive({
  headers: [
    { title: "شناسه", key: "id" },
    { title: "نام", key: "name", minWidth: 110 },
    { title: "عملیات", key: "actions", align: "center", sortable: false },
  ],
  page: 1,
  itemsPerPage: 10,
});

const product = reactive({
  headers: [
    { title: "شناسه", key: "id" },
    { title: "نام", key: "name" },
    { title: "دسته‌بندی", key: "category" },
    { title: "عملیات", key: "actions", align: "center", sortable: false },
  ],
  page: 1,
  itemsPerPage: 10,
});

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
    mutationFn: (body) => axios.post("categories", body),
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
    mutationFn: ({ id, body }) => {
      return axios.patch(`categories/${id}`, body);
    },
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
    mutationFn: ({ id, body }) => axios.patch(`products/${id}`, body),
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
    image: null,
  },
  async open(item) {
    this.canBeShown = true;
    this.item = null;
    await nextTick();
    this.formRef?.reset();
    this.form.image = null;
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
    if (this.form.image?.name) formData.append("image", this.form.image);
    updateCategory({ id: this.item.id, body: formData });
  },
});

const productSection = reactive({
  canBeShown: false,
  item: null,
  formRef: null,
  form: {
    name: "",
    category: null,
    coverImage: null,
    images: [],
    description: "",
  },
  async open(item) {
    this.canBeShown = true;
    this.item = null;
    await nextTick();
    this.formRef?.reset();
    this.form.coverImage = null;
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
    formData.append("image", this.form.coverImage);
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
    if (this.form.coverImage?.name)
      formData.append("image", this.form.coverImage);

    updateProduct({ id: this.item.id, body: formData });
  },
  clear() {
    this.item = null;
    this.formRef?.reset();
    this.form.coverImage = null;
    this.form.images = [];
  },
});

const selectedCat = ref(null);
const categoryProducts = computed(() =>
  products.value?.filter((x) => x.categoryId == selectedCat.value.id)
);

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
      :headers="category.headers"
      :items="categories"
      :page="category.page"
      :items-per-page="category.itemsPerPage"
      :page-text="`صفحه ${toPersianDigit(category.page)} از ${toPersianDigit(
        Math.ceil(categories?.length / category.itemsPerPage)
      )}`"
      :loading="isLoading_categories"
      :hide-default-footer="!categories?.length || isLoading_categories"
    >
      <template #item.actions="{ item }">
        <div class="d-flex justify-center align-center">
          <v-btn
            size="small"
            class="mx-1"
            text="افزودن محصول"
            color="primary"
            @click="addProductHandler(item)"
          />

          <v-edit-btn @click="dialog.open(item)" />

          <v-delete-btn
            :loading="isLoading_deleteCategory && deletingItemId == item.id"
            @click="deleteCategoryItem(item)"
          />
        </div>
      </template>
    </v-data-table>
  </template>

  <template v-else>
    <div class="d-flex align-center mb-4">
      <span>دسته‌بندی:&nbsp;</span>
      <v-chip label :text="selectedCat.name" />

      <v-btn
        append-icon="mdi-keyboard-backspace"
        class="mr-auto d-flex"
        text="بازگشت به دسته‌بندی‌ها"
        color="primary"
        @click="showProduct = false"
      />
    </div>

    <v-card class="mb-4 border" flat>
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
                v-model="productSection.form.name"
                label="نام محصول"
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

        <div
          style="height: 72px"
          class="d-flex px-4 py-2 flex-wrap align-center"
        >
          <v-spacer />

          <v-cancel-btn @click="productSection.clear()" />

          <v-submit-btn
            type="submit"
            :text="productSection.item ? 'ویرایش' : 'افزودن'"
            :loading="isLoading_createProduct || isLoading_updateProduct"
          />
        </div>
      </custom-form>
    </v-card>

    <v-data-table
      :headers="product.headers"
      :items="categoryProducts"
      :page="product.page"
      :items-per-page="product.itemsPerPage"
      :page-text="`صفحه ${toPersianDigit(product.page)} از ${toPersianDigit(
        Math.ceil(categoryProducts?.length / product.itemsPerPage)
      )}`"
      :loading="isLoading_products"
      :hide-default-footer="!categoryProducts?.length || isLoading_products"
    >
      <template #item.category="{ item }">
        {{ item.category.name }}
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-center">
          <v-edit-btn @click="productSection.open(item)" />

          <v-delete-btn
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
        <v-card-title>{{
          dialog.item ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"
        }}</v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="dialog.form.name"
                label="نام دسته‌بندی"
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

        <div
          style="height: 72px"
          class="d-flex px-6 py-4 flex-wrap align-center"
        >
          <v-spacer />

          <v-cancel-btn @click="dialog.close()" />

          <v-submit-btn
            type="submit"
            :text="dialog.item ? 'ویرایش' : 'افزودن'"
            :loading="isLoading_createCategory || isLoading_updateCategory"
          />
        </div>
      </custom-form>
    </v-card>
  </v-dialog>
</template>
