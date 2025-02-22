<script setup>
import axios from "@/axios";
import { areYouSure } from "@/utils/functions";
import { required, requiredArray } from "@/utils/formRules";

import { nextTick, ref } from "vue";
import vueFilePond from "vue-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

// Create FilePond component
const FilePond = vueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

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

const pond = ref(null);
const files = ref([]);
const acceptedFileTypes = ["image/jpeg", "image/png"];

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
      productSection.form.images.push(file);
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
      ).id;
      productSection.deletedImageIds.push(id);
      this.files = this.files.filter((x) => x.indexOf(file.name) == -1);
    }
    productSection.form.images = productSection.form.images.filter(
      (x) => x != file
    );
    this.isTouched = true;
  },
});

const handleFilePondAddFile = (error, { file }) => {
  if (error) {
    console.error("Error adding file", error);
    return;
  }
  if (file instanceof File) {
    isImageTouched.value = true;
    dialog.form.image = file;
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
      // productSection.formRef.reset();
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
      files.value = [item.imageUrl];
    }
  },
  close() {
    this.canBeShown = false;
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
        item.productImages.find((x) => x.isCoverImage).imageUrl,
      ];
      images.files = item.productImages
        .filter((x) => !x.isCoverImage)
        .map((x) => x.imageUrl);
    }
  },
  add() {
    if (!this.form.coverImage || !this.form.images.length) return;
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
    if (this.form.images.length) formData.append("gallery", this.form.images);
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
  images.isTouched = false;
  images.files = [];
  productSection.deletedImageIds = [];
  coverImage.isTouched = false;
  coverImage.files = [];
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
                v-model="productSection.form.name"
                label="نام محصول"
                variant="outlined"
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
                :class="{
                  error:
                    !productSection.form.images.length &&
                    !images.files.length &&
                    images.isTouched,
                }"
                ref="imagesPond"
                :credits="false"
                :accepted-file-types="acceptedFileTypes"
                :files="images.files"
                label-idle="تصاویر"
                allow-multiple
                @addfile="
                  (err, file) => images.handleFilePondAddFile(err, file)
                "
                @removefile="
                  (err, file) => images.handleFilePondRemoveFile(err, file)
                "
              />
              <div
                v-if="
                  !productSection.form.images.length &&
                  !images.files.length &&
                  images.isTouched
                "
                class="fs-12 px-4 text-error"
                style="padding-top: 6px"
              >
                الزامی
              </div>
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
            @click="
              if (!productSection.item) {
                coverImage.isTouched = true;
                images.isTouched = true;
              }
            "
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
                v-model="dialog.form.name"
                label="نام دسته‌بندی"
                variant="outlined"
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
            @click="if (!dialog.item) isImageTouched = true;"
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
