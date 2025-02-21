<script setup>
import { useAppStore } from "@/stores/app";
import { areYouSure } from "@/utils/functions";
import axios from "@/axios";
import { required, requiredArray } from "@/utils/formRules";
import vueFilePond from "vue-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { reactive, watch } from "vue";

// Create FilePond component
const FilePond = vueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

const isImagesTouched = ref(false);
const pond = ref(null);
const files = ref([]);
const acceptedFileTypes = ["image/jpeg", "image/png"];

const handleFilePondAddFile = (error, { file }) => {
  if (error) {
    console.error("Error adding file", error);
    return;
  }
  if (file instanceof File) {
    isImagesTouched.value = true;
    dialog.form.images.push(file);
  }
};

const handleFilePondRemoveFile = (error, { file }) => {
  if (error) {
    console.error("Error removing file", error);
    return;
  }
  if (dialog.item) {
    const id = dialog.item.productImages.find(
      (x) => x.imageUrl.indexOf(file.name) > -1
    ).id;
    dialog.deletedImageIds.push(id);
    files.value = files.value.filter((x) => x.indexOf(file.name) == -1);
  }
  dialog.form.images = dialog.form.images.filter((x) => x != file);
  isImagesTouched.value = true;
};

const coverImagePond = ref(null);
const coverImage = reactive({
  isTouched: false,
  files: [],
  handleFilePondAddFile(error, { file }) {
    if (error) {
      console.error("Error adding file", error);
      return;
    }
    if (file instanceof File) {
      this.isTouched = true;
      dialog.form.coverImage = file;
    }
  },
  handleFilePondRemoveFile(error, { file }) {
    if (error) {
      console.error("Error removing file", error);
      return;
    }
    this.files = [];
    dialog.form.coverImage = null;
    this.isTouched = true;
  },
});

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
    mutationFn: ({ id, body, params }) =>
      axios.patch(`products/${id}`, body, { params }),
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
  deletedImageIds: [],
  formRef: null,
  form: {
    name: "",
    category: null,
    coverImage: null,
    images: [],
    description: "",
  },
  async open(item) {
    isImagesTouched.value = false;
    files.value = [];
    this.deletedImageIds = [];
    coverImage.isTouched = false;
    coverImage.files = [];
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
      coverImage.files = [
        item.productImages.find((x) => x.isCoverImage).imageUrl,
      ];
      files.value = item.productImages
        .filter((x) => !x.isCoverImage)
        .map((x) => x.imageUrl);
    }
  },
  close() {
    this.canBeShown = false;
  },
  add() {
    if (!this.form.coverImage || !this.form.images.length) return;
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
    if (!this.form.coverImage && coverImage.isTouched) return;
    if (!this.form.images.length && !files.value.length) return;
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

    const options = { id: this.item.id, body: formData };
    if (this.deletedImageIds.length) {
      options.params = { deletedImageIds: this.deletedImageIds };
    }
    updateProduct(options);
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
      text="افرودن محصول"
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
            :loading="
              isLoading_createProductModel || isLoading_updateProductModel
            "
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
        <v-card-title style="height: 50px" class="bg-grey-lighten-3">{{
          dialog.item ? "ویرایش محصول" : "افزودن محصول"
        }}</v-card-title>

        <v-divider class="border-opacity-25" color="black" />

        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="dialog.form.name"
                label="نام محصول"
                variant="outlined"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="dialog.form.category"
                :items="categories"
                label="دسته بندی"
                variant="outlined"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <file-pond
                :class="{
                  error: dialog.form.coverImage == null && coverImage.isTouched,
                }"
                ref="coverImagePond"
                :credits="false"
                :accepted-file-types="acceptedFileTypes"
                :files="coverImage.files"
                label-idle="تصویر اصلی"
                @addfile="coverImage.handleFilePondAddFile()"
                @removefile="coverImage.handleFilePondRemoveFile()"
              />
              <div
                v-if="dialog.form.coverImage == null && coverImage.isTouched"
                class="fs-12 mt-n2 mr-4 text-error"
              >
                الزامی
              </div>
            </v-col>

            <v-col cols="12">
              <file-pond
                class="grid"
                :class="{
                  error:
                    !dialog.form.images.length &&
                    !files.length &&
                    isImagesTouched,
                }"
                ref="pond"
                :credits="false"
                :accepted-file-types="acceptedFileTypes"
                :files="files"
                label-idle="تصاویر"
                allow-multiple
                @addfile="handleFilePondAddFile"
                @removefile="handleFilePondRemoveFile"
              />
              <div
                v-if="
                  !dialog.form.images.length && !files.length && isImagesTouched
                "
                class="fs-12 mt-n2 mr-4 text-error"
              >
                الزامی
              </div>
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
            :loading="isLoading_createProduct || isLoading_updateProduct"
            @click="
              if (!dialog.item) {
                coverImage.isTouched = true;
                isImagesTouched = true;
              }
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
