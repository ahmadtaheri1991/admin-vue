<script setup>
import { areYouSure, toPersianDigit } from "@/utils/functions";
import axios from "@/axios";
import { required } from "@/utils/formRules";
import { useDisplay } from "vuetify/lib/framework.mjs";

const { xs } = useDisplay();

const statusColors = {
  pending: "grey",
  rejected: "error",
  preparation: "amber",
  posted: "success",
};
const statusTitles = {
  pending: "در انتظار",
  rejected: "رد شده",
  preparation: "آماده سازی",
  posted: "پست شده",
};

const acceptedOrder = reactive({
  headers: [
    { title: "", key: "row", sortable: false },
    {
      title: "نام و نام‌خانوادگی",
      key: "fullName",
      minWidth: 140,
    },
    { title: "شماره تماس", key: "phone", minWidth: 111 },
    {
      title: "زمان ثبت سفارش",
      key: "createdAt",
      align: "center",
      minWidth: 155,
    },
    { title: "وضعیت", key: "status", align: "center" },
    { title: "عملیات", key: "actions", align: "center", sortable: false },
  ],
  page: 1,
  itemsPerPage: 10,
});

const {
  data: acceptedOrders,
  refetch: refetch_acceptedOrders,
  isPending: isLoading_acceptedOrders,
} = useQuery({
  queryKey: ["acceptedOrders"],
  queryFn: () => axios.get("orders", { params: { status: "preparation" } }),
});

const { mutate: acceptOrder, isPending: isLoading_acceptOrder } = useMutation({
  mutationFn: (id) => axios.patch(`orders/accept/${id}`),
  onSuccess: () => {
    refetch_acceptedOrders();
  },
  onError: (error) => {
    console.log(error);
    const { data } = error.response;
    if (data.message) appStore.openAlert(2, data.message);
    else appStore.openAlert(2, "عملیات با خطا مواجه شد");
  },
});

const { mutate: rejectOrder, isPending: isLoading_rejectOrder } = useMutation({
  mutationFn: (id) => axios.patch(`orders/reject/${id}`),
  onSuccess: () => {
    refetch_acceptedOrders();
  },
  onError: (error) => {
    console.log(error);
    const { data } = error.response;
    if (data.message) appStore.openAlert(2, data.message);
    else appStore.openAlert(2, "عملیات با خطا مواجه شد");
  },
});

const { mutate: deliverOrder, isPending: isLoading_deliverOrder } = useMutation(
  {
    mutationFn: (id, body) => axios.patch(`orders/deliver/${id}`, body),
    onSuccess: () => {
      refetch_acceptedOrders();
      // sendSMS(item);
    },
    onError: (error) => {
      console.log(error);
      const { data } = error.response;
      if (data.message) appStore.openAlert(2, data.message);
      else appStore.openAlert(2, "عملیات با خطا مواجه شد");
    },
  }
);

const deliveringItemId = ref(0);

const dialog = reactive({
  canBeShown: false,
  item: null,
  table: {
    headers: [
      { title: "", key: "row", sortable: false },
      { title: "نام محصول", key: "name", minWidth: 105 },
      { title: "وزن", key: "weight", minWidth: 85 },
      { title: "تعداد", key: "count", align: "center" },
      { title: "قیمت واحد", key: "unitPrice", minWidth: 105, align: "center" },
      { title: "قیمت کل", key: "totalPrice", minWidth: 95, align: "center" },
      { title: "عملیات", key: "actions", align: "center" },
    ],
    items: [],
  },
  open(item) {
    this.canBeShown = true;
    this.item = item;

    this.table.items = computed(() =>
      this.item.orderItems.map((x) => ({
        ...x,
        name: x.product.name,
        weight: x.weight.name,
        unitPrice: x.price,
        totalPrice: x.count * x.price,
        alternate: x.editOrderItems,
      }))
    );
  },
  close() {
    this.canBeShown = false;
  },
});

async function postHandler(item) {
  const { isConfirmed } = await areYouSure();
  if (!isConfirmed) return;

  deliveringItemId.value = item.id;
  const body = { deliveryCode: item.deliveryCode };
  deliverOrder(item.id, body);
}

async function sendSMS(item) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "text/plain");
  // myHeaders.append("x-api-key", "");
  var raw = JSON.stringify({
    mobile: item.phone,
    // templateId: "",
    parameters: [
      //  { name: "PARAMETER1", value: "000000" },
    ],
  });
  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  fetch("https://api.sms.ir/v1/send/verify", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
}

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

const { data: productModels } = useQuery({
  queryKey: ["productModels"],
  queryFn: () => axios.get("productModels"),
  select: (items) =>
    items.map((x) => ({
      ...x,
      value: x.id,
      title: x.product.name + ` (${x.weight.name})`,
    })),
});

const {
  mutate: createEditOrderItem,
  isPending: isLoading_createEditOrderItem,
} = useMutation({
  mutationFn: (body) => axios.post("editOrderItem", body),
  onSuccess: async () => {
    await refetch_acceptedOrders();
    orderItemDialog.close();
    // dialog.close();
    // await nextTick();
    dialog.item = orders.value.find((x) => x.id == dialog.item.id);
    // dialog.open(dialog.item);
  },
  onError: (error) => {
    console.log(error);
    const { data } = error.response;
    if (data.message) appStore.openAlert(2, data.message);
    else appStore.openAlert(2, "عملیات با خطا مواجه شد");
  },
});

const orderItemDialog = reactive({
  canBeShown: false,
  item: null,
  formRef: null,
  form: {
    category: null,
    product: null,
    productModel: null,
    price: null,
    count: null,
    totalPrice: computed(
      () => orderItemDialog.form.count * orderItemDialog.form.price
    ),
    inventory: null,
  },
  open(item) {
    this.canBeShown = true;
    this.item = item;
  },
  close() {
    this.canBeShown = false;
  },
  edit() {
    const { id: orderId } = dialog.item;
    const { id: orderItemId } = this.item;
    const { productModel, price, count } = orderItemDialog.form;
    const body = {
      orderItemId,
      orderId,
      productModelId: productModel.value,
      productId: productModel.productId,
      weightId: productModel.weightId,
      count,
      price,
    };
    createEditOrderItem(body);
  },
});

watch(
  () => orderItemDialog.form.productModel,
  (value) => {
    orderItemDialog.form.price = null;
    orderItemDialog.form.inventory = null;
    if (!value) return;

    const { categoryId, productId } = productModels.value.find(
      (x) => x.value == value.value
    );
    orderItemDialog.form.category = categories.value.find(
      (x) => x.value == categoryId
    ).value;

    orderItemDialog.form.product = products.value.find(
      (x) => x.value == productId
    ).value;

    orderItemDialog.form.price = productModels.value.find(
      (x) => x.value == value.value
    )?.price;

    orderItemDialog.form.inventory = productModels.value.find(
      (x) => x.value == value.value
    )?.inventory;
  }
);

watch(
  () => orderItemDialog.form.category,
  (value) => {
    const { categoryId } =
      products.value.find((x) => x.value == orderItemDialog.form.product) || {};
    if (categoryId != value) orderItemDialog.form.product = null;
  }
);

watch(
  () => orderItemDialog.form.product,
  (value) => {
    const { productId } =
      productModels.value.find(
        (x) => x.value == orderItemDialog.form.productModel.value
      ) || {};
    if (productId != value) orderItemDialog.form.productModel = null;
    if (!value) return;

    const { categoryId } = products.value.find((x) => x.value == value);
    orderItemDialog.form.category = categories.value.find(
      (x) => x.value == categoryId
    ).value;
  }
);

const filteredProducts = computed(() => {
  if (!orderItemDialog.form.category) return products.value;
  return products.value?.filter(
    (x) => x.categoryId == orderItemDialog.form.category
  );
});

const filteredProductModels = computed(() => {
  if (!orderItemDialog.form.category && !orderItemDialog.form.product) {
    return productModels.value;
  }

  if (!orderItemDialog.form.product) {
    return productModels.value?.filter(
      (x) => x.categoryId == orderItemDialog.form.category
    );
  }

  return productModels.value?.filter(
    (x) => x.productId == orderItemDialog.form.product
  );
});

const printDialog = reactive({
  canBeShown: false,
  item: null,
  open(item) {
    this.canBeShown = true;
    this.item = item;
  },
  close() {
    this.canBeShown = false;
  },
});

function print(item) {
  printDialog.open(item);
}
</script>

<template>
  <v-data-table
    class="mt-4"
    :headers="acceptedOrder.headers"
    :items="acceptedOrders"
    :page="acceptedOrder.page"
    :items-per-page="acceptedOrder.itemsPerPage"
    :page-text="`صفحه ${toPersianDigit(acceptedOrder.page)} از ${toPersianDigit(
      Math.ceil(acceptedOrders?.length / acceptedOrder.itemsPerPage)
    )}`"
    :loading="isLoading_acceptedOrders"
    :hide-default-footer="!acceptedOrders?.length || isLoading_acceptedOrders"
  >
    <template #item.row="{ index }">{{ toPersianDigit(index + 1) }}</template>

    <template #item.phone="{ item }">
      {{ toPersianDigit(item.phone) }}
    </template>

    <template #item.payablePrice="{ item }">
      {{ numberWithCommas(toPersianDigit(item.payablePrice)) }}
    </template>

    <template #item.lastFourDigits="{ item }">
      {{ toPersianDigit(item.lastFourDigits) }}
    </template>

    <template #item.datetime="{ item: { month, day, hour, minute } }">
      <div style="direction: ltr">
        {{ toPersianDigit([month, "/", day, " ", hour, ":", minute].join("")) }}
      </div>
    </template>

    <template #item.createdAt="{ item }">
      {{
        new Date(item.createdAt).toLocaleString("fa-IR", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      }}
    </template>

    <template #item.status="{ item }">
      <v-chip
        class="width-80 text-center"
        label
        size="small"
        :color="statusColors[item.status]"
      >
        <div class="width-60 text-center">
          {{ statusTitles[item.status] }}
        </div>
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex justify-center align-center">
        <v-btn
          class="ml-5"
          color="primary"
          text="جزئیات"
          @click="dialog.open(item)"
        />

        <div class="width-270 mx-2">
          <v-text-field
            class="height-30"
            density="compact"
            variant="outlined"
            v-model="item.deliveryCode"
          ></v-text-field>
        </div>

        <v-btn
          color="amber"
          text="پست"
          :loading="isLoading_deliverOrder && deliveringItemId == item.id"
          @click="postHandler(item)"
        />

        <v-btn
          class="mr-5"
          color="secondary"
          text="پرینت"
          @click="print(item)"
        />
      </div>
    </template>
  </v-data-table>

  <v-dialog v-model="dialog.canBeShown">
    <v-card min-height="500px">
      <v-card-title>
        جزئیات سفارش {{ toPersianDigit(dialog.item.id) }}
      </v-card-title>

      <v-card-text>
        {{ dialog.name }}
        <v-row :dense="xs">
          <v-col cols="auto">
            <data-label :value="dialog.item.fullName" />
          </v-col>

          <v-col
            cols="auto"
            v-for="item in pendingOrder.headers.slice(2, -3)"
            :key="item.id"
          >
            <data-label
              style="direction: ltr"
              :title="item.title"
              :value="toPersianDigit(dialog.item[item.key])"
            />
          </v-col>

          <v-col cols="auto">
            <data-label title="زمان واریز">
              <span>{{
                toPersianDigit(
                  [dialog.item.month, "/", dialog.item.day].join("")
                )
              }}</span>
              <span class="mx-1"></span>
              <span>{{
                toPersianDigit(
                  [dialog.item.hour, ":", dialog.item.minute].join("")
                )
              }}</span>
            </data-label>
          </v-col>

          <v-col cols="auto">
            <data-label
              title="۴ رقم آخر شماره کارت"
              :value="toPersianDigit(dialog.item.lastFourDigits)"
            />
          </v-col>

          <v-col cols="auto">
            <data-label title="وضعیت">
              <span :class="`text-${statusColors[dialog.item.status]}`">
                {{ statusTitles[dialog.item.status] }}
              </span>
            </data-label>
          </v-col>
        </v-row>

        <v-data-table
          class="mt-4"
          :headers="dialog.table.headers"
          :items="dialog.table.items"
          :items-per-page="-1"
          show-expand
        >
          <template #bottom></template>

          <template #item.row="{ index }">{{
            toPersianDigit(index + 1)
          }}</template>

          <template #item.count="{ item }">{{
            toPersianDigit(item.count)
          }}</template>

          <template #item.unitPrice="{ item }">{{
            toPersianDigit(item.unitPrice)
          }}</template>

          <template #item.totalPrice="{ item }">{{
            toPersianDigit(item.totalPrice)
          }}</template>

          <!-- <template #headers="{ columns, toggleSort }">
            <tr class="bg-grey-lighten-3">
              <template v-for="column in columns" :key="column.key">
                <th :class="{ 'text-center': column.align == 'center' }">
                  <span
                    class="fw-600 fs-14"
                    @click="() => toggleSort(column)"
                    >{{ column.title }}</span
                  >
                </th>
              </template>
            </tr>
          </template> -->

          <template #item.actions="{ item }">
            <v-edit-btn @click="orderItemDialog.open(item)" />
          </template>

          <template
            #item.data-table-expand="{
              item: { alternate },
              internalItem,
              isExpanded,
              toggleExpand,
            }"
          >
            <v-btn
              v-if="alternate.length > 0"
              variant="text"
              @click="toggleExpand(internalItem)"
              :icon="
                isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'
              "
            />
          </template>

          <template #expanded-row="{ item: { alternate } }">
            <tr v-for="item in alternate" :key="item.id">
              <td></td>
              <td>{{ item.product.name }}</td>
              <td>{{ item.weight.name }}</td>
              <td>{{ item.count }}</td>
              <td>{{ item.price }}</td>
              <td>{{ item.price * item.count }}</td>
              <td></td>
              <td></td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>

      <div style="height: 72px" class="d-flex px-6 py-4 flex-wrap align-center">
        <v-spacer />

        <v-btn
          v-if="['pending', 'rejected'].includes(dialog.item.status)"
          height="40"
          min-width="80"
          color="green-lighten-4"
          text="تایید"
          flat
          :loading="isLoading_acceptOrder"
          @click="
            () => {
              acceptOrder(dialog.item.id);
              dialog.close();
            }
          "
        />

        <v-btn
          v-if="['pending', 'preparation'].includes(dialog.item.status)"
          height="40"
          min-width="80"
          class="mr-2"
          color="red-lighten-4"
          text="رد"
          flat
          :loading="isLoading_rejectOrder"
          @click="
            () => {
              rejectOrder(dialog.item.id);
              dialog.close();
            }
          "
        />

        <v-btn
          height="40"
          min-width="80"
          class="mr-2"
          color="primary"
          text="بستن"
          flat
          @click="dialog.close()"
        />
      </div>
    </v-card>
  </v-dialog>

  <v-dialog width="95vw" max-width="900" v-model="orderItemDialog.canBeShown">
    <v-card>
      <v-card-title> ویرایش آیتم سفارش </v-card-title>

      <custom-form
        v-model="orderItemDialog.formRef"
        @valid="orderItemDialog.edit()"
      >
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="orderItemDialog.form.category"
                :items="categories"
                label="دسته بندی"
                :rules="[required]"
                clearable
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="orderItemDialog.form.product"
                :items="filteredProducts"
                label="محصول"
                :rules="[required]"
                clearable
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="orderItemDialog.form.productModel"
                :items="filteredProductModels"
                label="بسته‌بندی محصول"
                :rules="[required]"
                clearable
                return-object
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                readonly
                v-model="orderItemDialog.form.price"
                label="قیمت"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="orderItemDialog.form.count"
                label="تعداد"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                readonly
                v-model="orderItemDialog.form.totalPrice"
                label="قیمت کل"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                readonly
                v-model="orderItemDialog.form.inventory"
                label="موجودی"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <div
          style="height: 72px"
          class="d-flex px-6 py-4 flex-wrap align-center"
        >
          <v-spacer />

          <v-cancel-btn @click="orderItemDialog.close()" />

          <v-submit-btn
            type="submit"
            text="ویرایش"
            :loading="isLoading_createEditOrderItem"
          />
        </div>
      </custom-form>
    </v-card>
  </v-dialog>

  <v-dialog fullscreen v-model="printDialog.canBeShown">
    <v-card>
      <v-card-text>
        <div class="d-flex">
          <div class="d-flex flex-column">
            <span>فروشگاه اینترنتی مزه رسون</span>

            <span class="fs-18">
              <div style="font-family: javan !important">
                دلت یه چیز خوشمزه میخواست؟

                <span style="font-family: javan !important" class="px-1">
                  من اینجام
                </span>

                <img
                  src="/images/labkhand.png"
                  width="13"
                  class="mx-1"
                  style="margin-bottom: -2px"
                />
              </div>
            </span>
          </div>

          <v-spacer />

          <img width="100" src="/images/logo-maze.png" />
        </div>

        <v-row dense>
          <v-col cols="12">فرستنده: {{ printDialog.item.deliveryCode }}</v-col>
          <v-col cols="6">گیرنده: {{ printDialog.item.fullName }}</v-col>
          <v-col cols="6"
            >شماره تماس: {{ toPersianDigit(printDialog.item.phone) }}</v-col
          >
          <v-col cols="6">آدرس: {{ printDialog.item.address }}</v-col>
          <v-col cols="6"
            >کد پستی: {{ toPersianDigit(printDialog.item.postalCode) }}</v-col
          >
          <v-col cols="6">توضیحات: {{ printDialog.item.description }}</v-col>
        </v-row>

        <div class="mt-5 mb-3">سفارش‌ها</div>

        <v-row>
          <v-col
            cols="6"
            v-for="(item, i) in printDialog.item.orderItems"
            :key="item.id"
          >
            {{ toPersianDigit(i + 1) }} -
            {{ item.product.name }}
            {{ toPersianDigit(item.weight.name) }}
            ({{ toPersianDigit(item.count) }} عدد)
          </v-col>
        </v-row>
      </v-card-text>

      <div style="height: 72px" class="d-flex px-6 py-4 flex-wrap align-center">
        <v-spacer />

        <v-cancel-btn class="d-print-none" @click="printDialog.close()" />
      </div>
    </v-card>
  </v-dialog>
</template>

<style>
.v-text-field.height-30 input {
  min-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
