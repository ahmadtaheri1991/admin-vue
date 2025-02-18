<script setup>
import { useAppStore } from "@/stores/app";
import { areYouSure } from "@/utils/functions";
import axios from "@/axios";
import { required, requiredArray } from "@/utils/formRules";

const headers_product = [
  { title: "شناسه", key: "id" },
  { title: "نام", key: "name" },
  { title: "دسته‌بندی", key: "category" },
  { title: "عملیات", key: "actions", align: "center", sortable: false },
];

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
  data: products,
  refetch: refetch_products,
  isPending: isLoading_products,
} = useQuery({
  queryKey: ["products"],
  queryFn: () => axios.get("products"),
});

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

const { data: weights } = useQuery({
  queryKey: ["weights"],
  queryFn: () => axios.get("weights"),
  select: (items) => items.map((x) => ({ value: x.id, title: x.name })),
});

const { mutate: createProduct, isPending: isLoading_createProduct } =
  useMutation({
    mutationFn: (body) => axios.post("products", body),
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
  });

const { mutate: updateProduct, isPending: isLoading_updateProduct } =
  useMutation({
    mutationFn: ({ id, body }) => axios.patch(`products/${id}`, body),
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

const { mutate: createProductModel, isPending: isLoading_createProductModel } =
  useMutation({
    mutationFn: (body) => axios.post("productModels", body),
    onSuccess: () => {
      appStore.openAlert(0, "با موفقیت افزوده شد");
      productModelSection.formRef.reset();
      refetch_productModels();
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
    mutationFn: ({ id, body }) => axios.patch(`productModels/${id}`, body),
    onSuccess: () => {
      appStore.openAlert(0, "با موفقیت ویرایش شد");
      productModelSection.clear();
      refetch_productModels();
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
  close() {
    this.canBeShown = false;
  },
  add() {
    const formData = new FormData();
    formData.append("name", this.form.name);
    formData.append("categoryId", this.form.category);
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
    if (this.form.images.length) {
      this.form.images.forEach((image) => {
        formData.append("gallery", image);
      });
    }
    if (this.form.coverImage?.name) {
      formData.append("image", this.form.coverImage);
    }

    updateProduct({ id: this.item.id, body: formData });
  },
});

const productModelSection = reactive({
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
  add() {
    const body = {
      categoryId: selectedProduct.value.categoryId,
      productId: selectedProduct.value.id,
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
      price: this.form.price,
      inventory: this.form.inventory,
    };
    updateProductModel({ id: this.item.id, body });
  },
  clear() {
    this.item = null;
    this.formRef?.reset();
  },
});

async function deleteProductItem(item) {
  const { isConfirmed } = await areYouSure();
  if (!isConfirmed) return;

  deletingItemId.value = item.id;
  deleteProduct(item.id);
}

async function deleteProductModelItem(item) {
  const { isConfirmed } = await areYouSure();
  if (!isConfirmed) return;

  deletingItemId.value = item.id;
  deleteProductModel(item.id);
}

const selectedProduct = ref(null);
const showProductModel = ref(false);

function addProductModelHandler(item) {
  selectedProduct.value = item;
  showProductModel.value = true;
}
</script>

<template>
  <template v-if="!showProductModel">
    <v-btn
      class="mb-3"
      color="primary"
      text="افزودن محصول"
      @click="dialog.open()"
    />

    <v-data-table
      class="border"
      :headers="headers_product"
      :items="products"
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
            text="افزودن مدل محصول"
            color="primary"
            @click="addProductModelHandler(item)"
          />

          <v-edit-btn color="warning" @click="dialog.open(item)" />

          <v-delete-btn
            :loading="isLoading_deleteProduct && deletingItemId == item.id"
            @click="deleteProductItem(item)"
          />
        </div>
      </template>
    </v-data-table>
  </template>

  <template v-else>
    <div class="d-flex">
      <span>{{ selectedProduct.name }}</span>

      <v-btn
        append-icon="mdi-keyboard-backspace"
        class="mb-3 mr-auto d-flex"
        text="بازگشت به محصولات"
        color="primary"
        @click="showProductModel = false"
      />
    </div>

    <v-card class="mb-3" elevation="2">
      <custom-form
        v-model="productModelSection.formRef"
        @valid="
          productModelSection.item
            ? productModelSection.update()
            : productModelSection.add()
        "
      >
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="productModelSection.form.weight"
                :items="weights"
                label="بسته‌بندی"
                variant="outlined"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="productModelSection.form.price"
                label="قیمت"
                variant="outlined"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="productModelSection.form.inventory"
                label="موجودی"
                variant="outlined"
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

          <v-cancel-btn @click="productModelSection.clear()" />

          <v-submit-btn
            :text="productModelSection.item ? 'ویرایش' : 'افزودن'"
            :loading="
              isLoading_createProductModel || isLoading_updateProductModel
            "
          />
        </div>
      </custom-form>
    </v-card>

    <v-data-table
      class="border"
      :headers="headers_productModel"
      :items="productModels.filter((x) => x.productId == selectedProduct.id)"
      :items-per-page="10"
      :loading="isLoading_productModels"
    >
      <template #item="{ item }">
        <tr :class="{ 'bg-red-lighten-4': item.inventory < 10 }">
          <td>{{ item.id }}</td>
          <td>{{ item.category.name }}</td>
          <td>{{ item.product.name }}</td>
          <td>{{ item.weight.name }}</td>
          <td>{{ item.price }}</td>
          <td>{{ item.inventory }}</td>
          <td>
            <div class="d-flex justify-center">
              <v-edit-btn @click="productModelSection.open(item)" />

              <v-delete-btn
                :loading="
                  isLoading_deleteProductModel && deletingItemId == item.id
                "
                @click="deleteProductModelItem(item)"
              />
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
  </template>

  <v-dialog max-width="900" v-model="dialog.canBeShown">
    <v-card>
      <custom-form
        v-model="dialog.formRef"
        @valid="dialog.item ? dialog.update() : dialog.add()"
      >
        <v-card-title>{{
          dialog.item ? "ویرایش محصول" : "افزودن محصول"
        }}</v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="dialog.form.name"
                label="نام محصول"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="dialog.form.category"
                :items="categories"
                label="دسته بندی"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-file-input
                v-model="dialog.form.coverImage"
                prepend-icon=""
                label="تصویر اصلی"
                variant="outlined"
                :rules="[dialog.item ? null : requiredArray]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-file-input
                v-model="dialog.form.images"
                prepend-icon=""
                label="تصاویر"
                variant="outlined"
                :rules="[dialog.item ? null : requiredArray]"
                multiple
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="dialog.form.description"
                label="توضیحات"
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
            :text="dialog.item ? 'ویرایش' : 'افزودن'"
            :loading="isLoading_createProduct || isLoading_updateProduct"
          />
        </div>
      </custom-form>
    </v-card>
  </v-dialog>
</template>
