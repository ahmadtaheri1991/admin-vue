<script setup>
import { useAppStore } from "@/stores/app";
import { areYouSure } from "@/utils/functions";

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
    mutationFn: (id, body) => axios.patch(`products/${id}`, body),
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

const dialog = reactive({
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
  close() {
    this.canBeShown = false;
  },
  add() {
    const formData = new FormData();
    formData.append("name", this.form.name);
    formData.append("categoryId", this.form.category);
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
});

const productModelSection = reactive({
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
  async add() {
    this.submitLoading = true;
    const { error } = await useFetch(`${apiBase}/productModels/create`, {
      method: "post",
      body: {
        categoryId: selectedProduct.value.categoryId,
        productId: selectedProduct.value.id,
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
    this.formRef.reset();
    productModelTable.refresh();
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
          price: this.form.price,
          inventory: this.form.inventory,
        },
      }
    );
    this.submitLoading = false;

    if (error.value) {
      appStore.openAlert(2, "عملیات با خطا مواجه شد");
      return;
    }

    appStore.openAlert(0, "با موفقیت ویرایش شد");
    this.clear();
    productModelTable.refresh();
  },
  clear() {
    this.item = null;
    this.formRef?.reset();
  },
});

const { data: categories } = await useFetch(`${apiBase}/categories`, {
  transform: (items) => items.map((x) => ({ value: x.id, title: x.name })),
});

const { data: weights } = await useFetch(`${apiBase}/weights`, {
  transform: (items) => items.map((x) => ({ value: x.id, title: x.name })),
});

async function deleteItem(item) {
  const { isConfirmed } = await areYouSure();
  if (!isConfirmed) return;

  const { error } = await useFetch(`/products/${item.id}`, {
    method: "delete",
  });

  appStore.openAlert(0, "حذف با موفقیت انجام شد");
  table.refresh();
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
      text="افرودن محصول"
      @click="dialog.open()"
    />

    <v-data-table
      class="border"
      :headers="table.headers"
      :items="table.items"
      :items-per-page="10"
      :loading="table.loading"
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

    <v-card class="mb-3">
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
                :disabled="productModelSection.item"
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
            :text="productModelSection.item ? 'ویرایش' : 'افزودن'"
            :loading="productModelSection.submitLoading"
          />

          <v-btn
            min-width="100"
            color="error"
            text="لغو"
            @click="productModelSection.clear()"
          />
        </div>
      </custom-form>
    </v-card>

    <v-data-table
      class="border"
      :headers="productModelTable.headers"
      :items="
        productModelTable.items.filter((x) => x.productId == selectedProduct.id)
      "
      :items-per-page="10"
      :loading="productModelTable.loading"
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
              <v-btn
                class="mx-1"
                text="ویرایش"
                color="warning"
                @click="productModelSection.open(item)"
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
  </template>

  <v-dialog max-width="900" v-model="dialog.canBeShown">
    <v-card>
      <custom-form
        v-model="dialog.formRef"
        @valid="dialog.item ? dialog.update() : dialog.add()"
      >
        <v-card-title style="height: 50px" class="bg-grey-lighten-3">{{
          dialog.item ? "ویرایش محصول" : "افزودن محصول"
        }}</v-card-title>

        <v-divider class="border-opacity-25" color="black" />

        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                :disabled="dialog.item"
                v-model="dialog.form.name"
                label="نام محصول"
                variant="outlined"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-select
                :disabled="dialog.item"
                v-model="dialog.form.category"
                :items="categories"
                label="دسته بندی"
                variant="outlined"
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
