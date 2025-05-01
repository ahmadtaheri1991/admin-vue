<script setup>
import axios from "@/axios";
import {
  areYouSure,
  toPersianDigit,
  numberWithCommas,
  toPersianNumber,
} from "@/utils/functions";
import { required } from "@/utils/formRules";
import vueFilePond from "vue-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageEdit from "filepond-plugin-image-edit";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "vue-advanced-cropper/dist/style.css";
import { Cropper } from "vue-advanced-cropper";
import imageCompression from "browser-image-compression";

const category = reactive({
  headers: [
    { title: "", key: "row", sortable: false },
    { title: "نام", key: "name", minWidth: 110 },
    { title: "عملیات", key: "actions", align: "center", sortable: false },
  ],
  page: 1,
  itemsPerPage: 10,
});

const selectedCat = ref(null);
const selectedProduct = ref(null);

const product = reactive({
  headers: [
    { title: "", key: "row", sortable: false },
    { title: "نام", key: "name" },
    { title: "دسته‌بندی", key: "category" },
    { title: "بسته‌بندی", key: "weight" },
    { title: "قیمت", key: "price", align: "center" },
    { title: "موجودی", key: "inventory", align: "center" },
    { title: "عملیات", key: "actions", align: "center", sortable: false },
  ],
  page: 1,
  itemsPerPage: 10,
});

// Create FilePond component
const FilePond = vueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginImageEdit
);

const originalFile = ref(null);

const imageEditEditor = {
  open: async (file) => {
    originalFile.value = file;
    currentImage.value = URL.createObjectURL(file);
    showCropper.value = true;
  },
  close: () => {
    showCropper.value = false;
    currentImage.value = null;
  },
};

const showCropper = ref(false);
const currentImage = ref(null);
const cropperRef = ref(null);

const appStore = useAppStore();
const showProduct = ref(false);

const pond = ref(null);
const files = ref([]);
const acceptedFileTypes = ["image/jpeg", "image/png"];

const compressionSettings = reactive({
  maxSizeMB: 0.1,
  maxWidthOrHeight: 500,
  initialQuality: 0.6,
  showDialog: false,
});

const compressImage = async (file) => {
  const options = {
    maxSizeMB: compressionSettings.maxSizeMB,
    maxWidthOrHeight: compressionSettings.maxWidthOrHeight,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: compressionSettings.initialQuality,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("خطا در فشرده‌سازی تصویر:", error);
    return file;
  }
};

const handleFilePondAddFile = async (error, { file }) => {
  if (error) {
    console.error("Error adding file", error);
    return;
  }
  if (file instanceof File) {
    isImageTouched.value = true;
    dialog.form.image = file;
    files.value = [file];
  }
};

const handleFilePondRemoveFile = (error, file) => {
  if (error) {
    console.error("Error removing file", error);
    return;
  }
  files.value = [];
  dialog.form.image = null;
  isImageTouched.value = true;
};

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
  queryKey: ["products", selectedCat.value?.id],
  queryFn: () =>
    axios.get(
      `products?categoryId=${selectedCat.value.id}&withProductModels=true`
    ),
  enabled: false,
});

const { data: weights } = useQuery({
  queryKey: ["weights"],
  queryFn: () => axios.get("weights"),
  select: (items) => items.map((x) => ({ value: x.id, title: x.name })),
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

const { mutate: updateProduct, isPending: isLoading_updateProduct } =
  useMutation({
    mutationFn: ({ id, body, params }) =>
      axios.patch(`products/${id}`, body, { params }),
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

const { mutate: createProductModel, isPending: isLoading_createProductModel } =
  useMutation({
    mutationFn: (body) => axios.post("productModels", body),
    onSuccess: () => {
      appStore.openAlert(0, "با موفقیت افزوده شد");
      productModelDialog.close();
      refetch_products();
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
      productModelDialog.close();
      refetch_products();
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
const deletingProductModelId = ref(0);

const isImageTouched = ref(false);
const dialog = reactive({
  canBeShown: false,
  item: null,
  formRef: null,
  form: {
    name: "",
    image: null,
  },
  async open(item) {
    isImageTouched.value = false;
    files.value = [];
    this.canBeShown = true;
    this.item = null;
    await nextTick();
    this.formRef?.reset();
    this.form.image = null;
    if (item) {
      this.item = item;
      this.form.name = item.name;
      files.value = [
        item.imageUrl.startsWith("http")
          ? item.imageUrl
          : `https://back.mazeresoon.ir/${item.imageUrl}`,
      ];
    }
  },
  close() {
    this.canBeShown = false;
    this.item = null;
  },
  add() {
    if (!this.form.image) return;
    const formData = new FormData();
    formData.append("name", this.form.name);
    formData.append("image", this.form.image);
    createCategory(formData);
  },
  update() {
    if (!this.form.image && isImageTouched.value) return;
    const formData = new FormData();
    formData.append("name", this.form.name);
    if (this.form.image?.name) formData.append("image", this.form.image);
    updateCategory({ id: this.item.id, body: formData });
  },
});

const productSection = reactive({
  canBeShown: false,
  deletedImageIds: [],
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
    images.isTouched = false;
    images.files = [];
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
        item.productImages
          .find((x) => x.isCoverImage)
          .imageUrl.startsWith("http")
          ? item.productImages.find((x) => x.isCoverImage).imageUrl
          : `https://back.mazeresoon.ir/${
              item.productImages.find((x) => x.isCoverImage).imageUrl
            }`,
      ];
      images.files = item.productImages
        .filter((x) => !x.isCoverImage)
        .map((x) =>
          x.imageUrl.startsWith("http")
            ? x.imageUrl
            : `https://back.mazeresoon.ir/${x.imageUrl}`
        );
    }
  },
  add() {
    if (!this.form.coverImage) return;
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
    if (!this.form.coverImage && coverImage.isTouched) return;
    if (!this.form.images.length && !images.files.length) return;
    const formData = new FormData();
    formData.append("name", this.form.name);
    formData.append("categoryId", this.form.category);
    formData.append("description", this.form.description);
    if (this.form.images.length) {
      this.form.images.forEach((image) => {
        formData.append("gallery", image);
      });
    }
    if (this.form.coverImage?.name)
      formData.append("image", this.form.coverImage);

    const options = { id: this.item.id, body: formData };
    if (this.deletedImageIds.length) {
      options.params = { deletedImageIds: this.deletedImageIds };
    }
    updateProduct(options);
  },
  clear() {
    this.item = null;
    this.formRef?.reset();
    images.files = [];
    coverImage.files = [];
    this.form.coverImage = null;
    this.form.images = [];
    this.deletedImageIds = [];
    setTimeout(() => {
      images.isTouched = false;
      coverImage.isTouched = false;
    }, 100);
  },
});

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

async function deleteProductModelItem(item) {
  const { isConfirmed } = await areYouSure();
  if (!isConfirmed) return;

  deletingProductModelId.value = item.id;
  deleteProductModel(item.id);
}

function addProductHandler(item) {
  selectedCat.value = item;
  refetch_products();
  showProduct.value = true;
  images.isTouched = false;
  images.files = [];
  productSection.deletedImageIds = [];
  coverImage.isTouched = false;
  coverImage.files = [];
}

// وقتی برش انجام شد
const onCrop = async ({ canvas }) => {
  canvas.toBlob(
    async (blob) => {
      const fileName = originalFile.value?.name || "cropped-image.jpg";
      const file = new File([blob], fileName, {
        type: "image/jpeg",
        lastModified: new Date().getTime(),
      });

      // فشرده‌سازی تصویر با تنظیمات جدید
      const compressedFile = await compressImage(file);

      // ایجاد یک فایل جدید با همان نام و تاریخ
      const newFile = new File([compressedFile], fileName, {
        type: "image/jpeg",
        lastModified: new Date().getTime(),
      });

      // تشخیص اینکه کدام بخش در حال ویرایش است
      if (showCropper.value) {
        if (
          originalFile.value === dialog.form.image ||
          files.value[0]?.indexOf?.(originalFile.value.name) > -1
        ) {
          // تصویر اصلی (دسته‌بندی)
          pond.value?.removeFiles(); // حذف فایل‌های قبلی از FilePond
          pond.value?.addFile(newFile); // اضافه کردن فایل جدید
        } else if (
          originalFile.value === productSection.form.coverImage ||
          coverImage.files[0]?.indexOf?.(originalFile.value.name) > -1
        ) {
          // تصویر پوشش
          coverImagePond.value?.removeFiles(); // حذف فایل‌های قبلی
          coverImagePond.value?.addFile(newFile); // اضافه کردن فایل جدید
        } else {
          // تصاویر گالری
          const index = productSection.form.images.indexOf(originalFile.value);

          if (index !== -1) {
            productSection.form.images.splice(index, 1, newFile); // Replace in form.images
            images.files.splice(index, 1, newFile); // Replace in files
          } else {
            // If not found (new file), add it
            productSection.form.images.push(newFile);
            images.files.push(newFile);
          }
          const pondFiles = imagesPond.value?.getFiles();
          if (pondFiles?.length) {
            const fileToRemove = pondFiles.findIndex(
              (f) => f.file === originalFile.value
            );
            if (fileToRemove >= 0) {
              imagesPond.value.removeFile(fileToRemove);
            }
          }
          await nextTick();
          imagesPond.value?.addFile(newFile);
        }
      }

      showCropper.value = false;
    },
    "image/jpeg",
    1
  );
};

const coverImagePond = ref(null);
const imagesPond = ref(null);

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
      productSection.form.coverImage = file;
      this.files = [file];
    }
  },
  handleFilePondRemoveFile(error, { file }) {
    if (error) {
      console.error("Error removing file", error);
      return;
    }
    this.files = [];
    productSection.form.coverImage = null;
    this.isTouched = true;
  },
});

const images = reactive({
  isTouched: false,
  files: [],
  handleFilePondAddFile(error, { file }) {
    if (error) {
      console.error("Error adding file", error);
      return;
    }
    if (file instanceof File) {
      this.isTouched = true;
      if (!productSection.form.images.some((img) => img === file)) {
        productSection.form.images.push(file);
        this.files.push(file);
      }
    }
  },
  handleFilePondRemoveFile(error, { file }) {
    if (error) {
      console.error("Error removing file", error);
      return;
    }
    if (productSection.item) {
      const id = productSection.item.productImages.find(
        (x) => x.imageUrl.indexOf(file.name) > -1
      )?.id;
      if (id) productSection.deletedImageIds.push(id);
      this.files = this.files.filter((x) => x.indexOf(file.name) == -1);
    }
    productSection.form.images = productSection.form.images.filter(
      (x) => x != file
    );
    productSection.form.images.filter((x) => x.name.indexOf(file.name) == -1);
    this.files.filter((x) => x.name.indexOf(file.name) == -1);

    this.isTouched = true;
  },
});

const productModelDialog = reactive({
  canBeShown: false,
  item: null,
  formRef: null,
  form: {
    weightId: null,
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
      this.form.weightId = item.weightId;
      this.form.price = item.price;
      this.form.inventory = item.inventory;
    }
  },
  close() {
    this.canBeShown = false;
    this.item = null;
  },
  add() {
    const body = {
      categoryId: selectedCat.value.id,
      productId: selectedProduct.value.id,
      ...this.form,
      // weightId: this.form.weight,
      // price: this.form.price,
      // inventory: this.form.inventory,
    };
    createProductModel(body);
  },
  update() {
    const body = {
      categoryId: selectedCat.value.id,
      productId: selectedProduct.value.id,
      ...this.form,
      // weightId: this.form.weight,
      // price: this.form.price,
      // inventory: this.form.inventory,
    };
    updateProductModel({ id: this.item.id, body });
  },
  clear() {
    this.item = null;
    this.formRef?.reset();
  },
});
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
      <template #item.row="{ index }">{{ toPersianDigit(index + 1) }}</template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-center align-center">
          <v-btn
            class="rounded-circle fs-14"
            size="x-small"
            variant="text"
            icon="mdi-cube-outline"
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
              <file-pond
                :class="{
                  error:
                    productSection.form.coverImage == null &&
                    coverImage.isTouched,
                }"
                ref="coverImagePond"
                :credits="false"
                :accepted-file-types="acceptedFileTypes"
                :files="coverImage.files"
                label-idle="تصویر اصلی"
                :image-edit-editor="imageEditEditor"
                @addfile="
                  (err, file) => coverImage.handleFilePondAddFile(err, file)
                "
                @removefile="
                  (err, file) => coverImage.handleFilePondRemoveFile(err, file)
                "
              />
              <div
                v-if="
                  productSection.form.coverImage == null && coverImage.isTouched
                "
                class="fs-12 px-4 text-error"
                style="padding-top: 6px"
              >
                الزامی
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <file-pond
                class="grid"
                ref="imagesPond"
                :credits="false"
                :accepted-file-types="acceptedFileTypes"
                :files="images.files"
                label-idle="تصاویر"
                allow-multiple
                :image-edit-editor="imageEditEditor"
                @addfile="
                  (err, file) => images.handleFilePondAddFile(err, file)
                "
                @removefile="
                  (err, file) => images.handleFilePondRemoveFile(err, file)
                "
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
            @click="
              if (!productSection.item) {
                coverImage.isTouched = true;
                images.isTouched = true;
              }
            "
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
      show-expand
    >
      <template #item.row="{ index }">{{ toPersianDigit(index + 1) }}</template>

      <template #item.category="{ item }">
        {{ item.category.name }}
      </template>

      <template
        #item.data-table-expand="{
          item: { productModels },
          internalItem,
          isExpanded,
          toggleExpand,
        }"
      >
        <v-btn
          class="fs-14"
          rounded="circle"
          variant="text"
          size="x-small"
          v-if="productModels.length > 0"
          @click="toggleExpand(internalItem)"
          :icon="
            isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'
          "
        />
      </template>

      <template #expanded-row="{ item: { productModels } }">
        <tr v-for="item in productModels" :key="item.id">
          <td colspan="3"></td>
          <td>{{ item.weight.name }}</td>
          <td class="text-center">{{ item.price }}</td>
          <td class="text-center">{{ item.inventory }}</td>
          <td class="text-center">
            <v-edit-btn @click="productModelDialog.open(item)" />

            <v-delete-btn
              :loading="
                isLoading_deleteProductModel &&
                deletingProductModelId == item.id
              "
              @click="deleteProductModelItem(item)"
            />
          </td>
          <td></td>
        </tr>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-center align-center">
          <v-edit-btn @click="productSection.open(item)" />

          <v-delete-btn
            :loading="isLoading_deleteProduct && deletingItemId == item.id"
            @click="deleteProductItem(item)"
          />

          <v-btn
            class="mx-1 rounded-circle fs-14"
            size="x-small"
            variant="text"
            icon="mdi-package-variant-closed-plus"
            @click="
              () => {
                selectedProduct = item;
                productModelDialog.open();
              }
            "
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
              <file-pond
                :class="{ error: dialog.form.image == null && isImageTouched }"
                ref="pond"
                :credits="false"
                :accepted-file-types="acceptedFileTypes"
                :files="files"
                label-idle="تصویر"
                :image-edit-editor="imageEditEditor"
                @addfile="handleFilePondAddFile"
                @removefile="handleFilePondRemoveFile"
              />
              <div
                v-if="dialog.form.image == null && isImageTouched"
                class="fs-12 px-4 text-error"
                style="padding-top: 6px"
              >
                الزامی
              </div>
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
            @click="if (!dialog.item) isImageTouched = true;"
          />
        </div>
      </custom-form>
    </v-card>
  </v-dialog>

  <v-dialog max-width="400" v-model="productModelDialog.canBeShown">
    <v-card>
      <custom-form
        v-model="productModelDialog.formRef"
        @valid="
          productModelDialog.item
            ? productModelDialog.update()
            : productModelDialog.add()
        "
      >
        <v-card-title>{{
          productModelDialog.item ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"
        }}</v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="productModelDialog.form.weightId"
                :items="weights"
                label="بسته‌بندی"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                dir="auto"
                v-model="productModelDialog.form.price"
                label="قیمت"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                dir="auto"
                v-model="productModelDialog.form.inventory"
                label="موجودی"
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

          <v-cancel-btn @click="productModelDialog.close()" />

          <v-submit-btn
            type="submit"
            :text="productModelDialog.item ? 'ویرایش' : 'افزودن'"
            :loading="
              isLoading_createProductModel || isLoading_updateProductModel
            "
            @click="if (!productModelDialog.item) isImageTouched = true;"
          />
        </div>
      </custom-form>
    </v-card>
  </v-dialog>

  <!-- حذف دیالوگ‌های قبلی و اضافه کردن دیالوگ جدید -->
  <v-dialog v-model="showCropper" max-width="1200" class="image-editor-dialog">
    <v-card>
      <v-card-title class="py-2">ویرایش تصویر</v-card-title>
      <v-card-text class="pa-2">
        <v-row no-gutters>
          <v-col cols="12" md="7" class="pa-2">
            <div class="cropper-container">
              <cropper
                ref="cropperRef"
                :src="currentImage"
                :stencil-props="{ aspectRatio: 1 }"
                class="cropper"
              />
            </div>
          </v-col>

          <v-col cols="12" md="5" class="pa-2">
            <v-card flat class="compression-settings">
              <v-card-title>تنظیمات فشرده‌سازی</v-card-title>

              <v-card-text class="py-0">
                <div class="text-caption">حداکثر حجم (مگابایت)</div>
                <v-slider
                  v-model="compressionSettings.maxSizeMB"
                  :min="0.1"
                  :max="1"
                  :step="0.1"
                  thumb-label
                  density="compact"
                  class="mt-0 mb-3"
                />

                <div class="text-caption">حداکثر عرض/ارتفاع (پیکسل)</div>
                <v-slider
                  v-model="compressionSettings.maxWidthOrHeight"
                  :min="100"
                  :max="1000"
                  :step="100"
                  thumb-label
                  density="compact"
                  class="mt-0 mb-3"
                />

                <div class="text-caption">کیفیت تصویر</div>
                <v-slider
                  v-model="compressionSettings.initialQuality"
                  :min="0.1"
                  :max="1"
                  :step="0.1"
                  thumb-label
                  density="compact"
                  class="mt-0"
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="error" @click="showCropper = false">انصراف</v-btn>
        <v-btn color="primary" @click="onCrop(cropperRef.getResult())">
          ذخیره
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.image-editor-dialog :deep(.cropper-container) {
  height: 60vh;
  background: #f5f5f5;
  border-radius: 4px;
}

.image-editor-dialog :deep(.cropper) {
  height: 100%;
  width: 100%;
}

.compression-settings {
  height: 100%;
  padding: 8px;
}

.compression-settings :deep(.v-slider) {
  margin-top: 16px;
}
</style>
