<script setup>
import axios from "@/axios";

const appStore = useAppStore();
const showProduct = ref(false);

const { isLoading, data, refetch } = useQuery({
  queryKey: ["categories"],
  queryFn: () => axios.get("categories"),
});

const {
  isLoading: isProductsLoading,
  data: products,
  refetch: refetchProducts,
} = useQuery({
  queryKey: ["products"],
  queryFn: () => axios.get("products"),
});

const { mutate, isLoading: isCreateLoading } = useMutation({
  mutationFn: (body) => axios.post("categories/create", body),
  onSuccess: ({ data }) => {
    appStore.openAlert(0, "با موفقیت افزوده شد");
    refetch();
    dialog.close();
  },
  onError: (error) => {
    console.log(error);
    const { data } = error.response;
    if (data.message) appStore.openAlert(2, data.message);
    else appStore.openAlert(2, "عملیات با خطا مواجه شد");
  },
});

const { mutate: updateCategory, isLoading: isUpdateLoading } = useMutation({
  mutationFn: (id, body) => axios.patch(`categories/${id}`, body),
  onSuccess: ({ data }) => {
    appStore.openAlert(0, "با موفقیت ویرایش شد");
    refetch();
    dialog.close();
  },
  onError: (error) => {
    console.log(error);
    const { data } = error.response;
    if (data.message) appStore.openAlert(2, data.message);
    else appStore.openAlert(2, "عملیات با خطا مواجه شد");
  },
});

const { mutate: deleteCategory, isLoading: isDeleteLoading } = useMutation({
  mutationFn: (id) => axios.delete(`categories/delete/${id}`),
  onSuccess: ({ data }) => {
    appStore.openAlert(0, "حذف با موفقیت انجام شد");
    refetch();
  },
  onError: (error) => {
    console.log(error);
    const { data } = error.response;
    if (data.message) appStore.openAlert(2, data.message);
    else appStore.openAlert(2, "عملیات با خطا مواجه شد");
  },
});

const table = reactive({
  headers: [
    { title: "شناسه", key: "id" },
    { title: "نام", key: "name" },
    { title: "عملیات", key: "actions", align: "center", sortable: false },
  ],
  itemsPerPage: 10,
});

const productTable = reactive({
  headers: [
    { title: "شناسه", key: "id" },
    { title: "نام", key: "name" },
    { title: "دسته‌بندی", key: "category" },
    { title: "عملیات", key: "actions", align: "center", sortable: false },
  ],
  itemsPerPage: 10,
});

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
    formData.append("image", this.form.image[0]);
    mutate(formData);
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
  submitLoading: false,
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
  async add() {
    const formData = new FormData();
    formData.append("name", this.form.name);
    formData.append("categoryId", selectedCat.value.id);
    formData.append("description", this.form.description);
    formData.append("image", this.form.coverImage[0]);
    this.form.images.forEach((image) => {
      formData.append("gallery", image);
    });

    this.submitLoading = true;
    const { error } = await axios.post("products/create", formData);
    this.submitLoading = false;

    if (error.value) {
      const { data } = error.value;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
      return;
    }

    appStore.openAlert(0, "با موفقیت افزوده شد");
    this.formRef.reset();
    refetchProducts();
  },
  async update() {
    const formData = new FormData();
    formData.append("name", this.form.name);
    formData.append("categoryId", this.form.category);
    formData.append("description", this.form.description);
    if (this.form.images.length) formData.append("gallery", this.form.images);
    if (this.form.coverImage.length)
      formData.append("image", this.form.coverImage[0]);

    this.submitLoading = true;
    const { error } = await axios.patch(`products/${this.item.id}`, formData);
    this.submitLoading = false;

    if (error.value) {
      appStore.openAlert(2, "عملیات با خطا مواجه شد");
      return;
    }

    appStore.openAlert(0, "با موفقیت ویرایش شد");
    this.clear();
    refetchProducts();
  },
  clear() {
    this.item = null;
    this.formRef?.reset();
    this.form.coverImage = [];
    this.form.images = [];
  },
});

const selectedCat = ref(null);

async function deleteItem(item) {
  const { isConfirmed } = await $swal.fire({
    icon: "question",
    text: "آیا مطمئن هستید؟",
    confirmButtonText: "بله",
    showCancelButton: true,
    cancelButtonText: "خیر",
    customClass: {
      cancelButton: "bg-red",
      confirmButton: "bg-success",
    },
  });
  if (!isConfirmed) return;

  deleteCategory(item.id);
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
      :headers="table.headers"
      :items="data"
      :items-per-page="table.itemsPerPage"
      :loading="isLoading"
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
            :loading="item.deleteLoading"
            @click="deleteItem(item)"
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
            :loading="productSection.submitLoading"
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
      :headers="productTable.headers"
      :items="products?.filter((x) => x.categoryId == selectedCat.id)"
      :items-per-page="productTable.itemsPerPage"
      :loading="isProductsLoading"
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
            :loading="item.deleteLoading"
            @click="deleteItem(item)"
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
            :loading="isUpdateLoading || isCreateLoading"
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
