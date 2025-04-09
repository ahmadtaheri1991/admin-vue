<script setup>
import { useAppStore } from "@/stores/app";
import { areYouSure, toPersianDigit } from "@/utils/functions";
import axios from "@/axios";
import { required, requiredArray } from "@/utils/formRules";
import vueFilePond from "vue-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "vue-advanced-cropper/dist/style.css";
import { Cropper } from "vue-advanced-cropper";
import imageCompression from "browser-image-compression";
import { nextTick } from "vue";

// Create FilePond component
const FilePond = vueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

const originalFile = ref(null);
const showCropper = ref(false);
const currentImage = ref(null);
const cropperRef = ref(null);

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

const compressionSettings = reactive({
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  initialQuality: 1,
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

const onCrop = async ({ canvas }) => {
  canvas.toBlob(
    async (blob) => {
      const fileName = originalFile.value?.name || "cropped-image.jpg";
      const file = new File([blob], fileName, {
        type: "image/jpeg",
        lastModified: new Date().getTime(),
      });

      const compressedFile = await compressImage(file);
      const newFile = new File([compressedFile], fileName, {
        type: "image/jpeg",
        lastModified: new Date().getTime(),
      });

      if (showCropper.value) {
        if (
          originalFile.value === dialog.form.coverImage ||
          coverImage.files[0]?.indexOf?.(originalFile.value.name) > -1
        ) {
          coverImagePond.value?.removeFiles();
          coverImagePond.value?.addFile(newFile);
        } else {
          const index = dialog.form.images.indexOf(originalFile.value);

          if (index !== -1) {
            dialog.form.images.splice(index, 1, newFile);
            files.value.splice(index, 1, newFile);
          } else {
            // If not found (new file), add it
            dialog.form.images.push(newFile);
            files.value.push(newFile);
          }
          const pondFiles = pond.value.getFiles();
          if (pondFiles?.length) {
            const fileToRemove = pondFiles.findIndex(
              (f) => f.file === originalFile.value
            );
            if (fileToRemove >= 0) {
              pond.value.removeFile(fileToRemove);
            }
          }

          await nextTick();
          pond.value?.addFile(newFile);
        }
      }

      showCropper.value = false;
    },
    "image/jpeg",
    1
  );
};

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
    if (!dialog.form.images.some((img) => img === file)) {
      dialog.form.images.push(file);
      files.value.push(file);
    }
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
    )?.id;
    if (id) dialog.deletedImageIds.push(id);
    files.value = files.value.filter((x) => x.indexOf(file.name) == -1);
  }
  dialog.form.images = dialog.form.images.filter((x) => x != file);
  dialog.form.images.filter((x) => x.name.indexOf(file.name) == -1);
  this.files.filter((x) => x.name.indexOf(file.name) == -1);

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
      this.files = [file];
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

const product = reactive({
  headers: [
    { title: "", key: "row", sortable: false },
    { title: "نام", key: "name" },
    { title: "دسته‌بندی", key: "category" },
    { title: "عملیات", key: "actions", align: "center", sortable: false },
  ],
  page: 1,
  itemsPerPage: 10,
});

const productModel = reactive({
  headers: [
    { title: "", key: "row", sortable: false },
    { title: "دسته‌بندی", key: "category" },
    { title: "محصول", key: "product" },
    { title: "بسته‌بندی", key: "weight" },
    { title: "قیمت", key: "price", align: "center" },
    { title: "موجودی", key: "inventory", align: "center" },
    { title: "عملیات", key: "actions", align: "center", sortable: false },
  ],
  page: 1,
  itemsPerPage: 10,
});

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
        item.productImages
          .find((x) => x.isCoverImage)
          .imageUrl.startsWith("http")
          ? item.productImages.find((x) => x.isCoverImage).imageUrl
          : `https://back.mazeresoon.ir/${
              item.productImages.find((x) => x.isCoverImage).imageUrl
            }`,
      ];
      files.value = item.productImages
        .filter((x) => !x.isCoverImage)
        .map((x) =>
          x.imageUrl.startsWith("http")
            ? x.imageUrl
            : `https://back.mazeresoon.ir/${x.imageUrl}`
        );
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
const productProductModels = computed(() =>
  productModels.value.filter((x) => x.productId == selectedProduct.value.id)
);
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
      :headers="product.headers"
      :items="products"
      :page="product.page"
      :items-per-page="product.itemsPerPage"
      :page-text="`صفحه ${toPersianDigit(product.page)} از ${toPersianDigit(
        Math.ceil(products?.length / product.itemsPerPage)
      )}`"
      :loading="isLoading_products"
      :hide-default-footer="!products?.length || isLoading_products"
    >
      <template #item.row="{ index }">{{ toPersianDigit(index + 1) }}</template>

      <template #item.category="{ item }">
        {{ item.category.name }}
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-center align-center">
          <v-btn
            class="mx-1"
            text="افزودن بسته‌بندی محصول"
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
    <div class="d-flex align-center mb-4">
      <span>محصول:&nbsp;</span>
      <v-chip label :text="selectedProduct.name" />

      <v-btn
        append-icon="mdi-keyboard-backspace"
        class="mr-auto d-flex"
        text="بازگشت به محصولات"
        color="primary"
        @click="showProductModel = false"
      />
    </div>

    <v-card class="mb-4 border" flat>
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
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="productModelSection.form.price"
                label="قیمت"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="productModelSection.form.inventory"
                label="موجودی"
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
            type="submit"
            :text="productModelSection.item ? 'ویرایش' : 'افزودن'"
            :loading="
              isLoading_createProductModel || isLoading_updateProductModel
            "
          />
        </div>
      </custom-form>
    </v-card>

    <v-data-table
      :headers="productModel.headers"
      :items="productProductModels"
      :page="productModel.page"
      :items-per-page="productModel.itemsPerPage"
      :page-text="`صفحه ${toPersianDigit(
        productModel.page
      )} از ${toPersianDigit(
        Math.ceil(productProductModels?.length / productModel.itemsPerPage)
      )}`"
      :loading="isLoading_productModels"
      :hide-default-footer="
        !productProductModels?.length || isLoading_productModels
      "
    >
      <template #item="{ item, index }">
        <tr :class="{ 'bg-red-lighten-4': item.inventory < 10 }">
          <td>{{ toPersianDigit(index + 1) }}</td>
          <td>{{ item.category.name }}</td>
          <td>{{ item.product.name }}</td>
          <td>{{ item.weight.name }}</td>
          <td class="text-center">{{ toPersianDigit(item.price) }}</td>
          <td class="text-center">{{ toPersianDigit(item.inventory) }}</td>
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
              <file-pond
                :class="{
                  error: dialog.form.coverImage == null && coverImage.isTouched,
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
                v-if="dialog.form.coverImage == null && coverImage.isTouched"
                class="fs-12 px-4 text-error"
                style="padding-top: 6px"
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
                :image-edit-editor="imageEditEditor"
                @addfile="handleFilePondAddFile"
                @removefile="handleFilePondRemoveFile"
              />
              <div
                v-if="
                  !dialog.form.images.length && !files.length && isImagesTouched
                "
                class="fs-12 px-4 text-error"
                style="padding-top: 6px"
              >
                الزامی
              </div>
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
            type="submit"
            :text="dialog.item ? 'ویرایش' : 'افزودن'"
            :loading="isLoading_createProduct || isLoading_updateProduct"
            @click="
              if (!dialog.item) {
                coverImage.isTouched = true;
                isImagesTouched = true;
              }
            "
          />
        </div>
      </custom-form>
    </v-card>
  </v-dialog>

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
                  :max="3"
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
