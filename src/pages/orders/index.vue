<script setup>
import Swal from "sweetalert2";
// import Swal from "sweetalert2/dist/sweetalert2.js";
// import "sweetalert2/src/sweetalert2.scss";

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
const {
  public: { apiBase, urlBase },
} = useRuntimeConfig();

const table = reactive({
  headers: [
    { title: "", key: "id", width: 40, sortable: false, align: "center" },
    { title: "نام و نام‌خانوادگی", key: "fullName" },
    { title: "شماره تماس", key: "phone" },
    // { title: 'مجموع', key: 'totalPrice' },
    // { title: "مبلغ قابل پرداخت", key: "payablePrice" },
    // { title: 'هزینه ارسال', key: 'sendCost' }
    // { title: "شماره کارت", key: "lastFourDigits", align: "center" },
    // { title: "زمان", key: "datetime", align: "center" },
    { title: "زمان ثبت سفارش", key: "createdAt", align: "center" },
    { title: "وضعیت", key: "status", align: "center" },
    { title: "عملیات", key: "actions", align: "center" },
  ],
  items: [],
  loading: false,
  itemsPerPage: 10,
  refresh: null,
});

const filteredItems = computed(() => {
  return table.items?.filter(x =>
    [x.fullName, x.phone].some(y => y.indexOf(search.value.trim()) > -1)
  );
});

({
  data: table.items = [],
  pending: table.loading,
  refresh: table.refresh,
} = await useFetch(`${apiBase}/orders`, {
  transform: items =>
    items.map(x => ({
      ...x,
      isAcceptLoading: false,
      isRejectLoading: false,
      postLoading: false,
    })),
}));

const dialog = reactive({
  canBeShown: false,
  item: null,
  table: {
    headers: [
      { title: "ردیف", key: "row" },
      { title: "نام محصول", key: "name" },
      { title: "وزن", key: "weight" },
      { title: "تعداد", key: "count" },
      { title: "قیمت واحد", key: "unitPrice" },
      { title: "قیمت کل", key: "totalPrice" },
      { title: "عملیات", key: "actions" },
    ],
    items: [],
    itemsPerPage: 10,
  },
  open(item) {
    this.canBeShown = true;
    this.item = item;

    this.table.items = this.item.orderItems.map(x => ({
      ...x,
      name: x.product.name,
      weight: x.weight.name,
      unitPrice: x.price,
      totalPrice: x.count * x.price,
      alternate: x.editOrderItems,
    }));
  },
  close() {
    this.canBeShown = false;
  },
});

async function acceptOrder(item) {
  item.isAcceptLoading = true;
  await useFetch(`${apiBase}/orders/accept`, {
    method: "patch",
    body: { id: item.id },
  });
  await table.refresh();
  item.isAcceptLoading = false;
}

async function rejectOrder(item) {
  item.isRejectLoading = true;
  await useFetch(`${apiBase}/orders/reject`, {
    method: "patch",
    body: { id: item.id },
  });
  await table.refresh();
  item.isRejectLoading = false;
}

const search = ref("");
async function postHandler(item) {
  const { isConfirmed } = await Swal.fire({
    icon: "question",
    text: `آیا مطمئن هستید؟`,
    confirmButtonText: "بله",
    showCancelButton: true,
    cancelButtonText: "خیر",
    customClass: {
      cancelButton: "bg-red",
      confirmButton: "bg-success",
    },
  });

  if (!isConfirmed) return;
  item.postLoading = true;
  await useFetch(`${apiBase}/orders/deliver`, {
    method: "patch",
    body: { id: item.id, deliveryCode: item.deliveryCode },
  });
  await table.refresh();
  item.postLoading = false;
  // sendSMS(item);
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
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log("error", error));
}

const { data: categories = [] } = await useFetch(`${apiBase}/categories`, {
  transform: items =>
    items.map(x => ({
      value: x.id,
      title: x.name,
    })),
});

const { data: products = [] } = await useFetch(`${apiBase}/products`, {
  transform: items =>
    items.map(x => ({
      ...x,
      value: x.id,
      title: x.name,
    })),
});

const { data: productModels = [] } = await useFetch(
  `${apiBase}/productModels`,
  {
    transform: items =>
      items.map(x => ({
        ...x,
        value: x.id,
        title: item.product.name + ` (${item.weight.name})`,
      })),
  }
);

const orderItemDialog = reactive({
  canBeShown: false,
  item: null,
  formRef: null,
  isSubmitLoading: false,
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

  async edit() {
    const { id: orderId } = dialog.item;
    const { id: orderItemId } = this.item;
    const { productModel, price, count } = orderItemDialog.form;

    ({ pending: this.isSubmitLoading } = await useFetch(
      `${apiBase}/editOrderItem/create`,
      {
        method: "post",
        body: {
          orderItemId,
          orderId,
          productModelId: productModel.value,
          productId: productModel.productId,
          weightId: productModel.weightId,
          count,
          price,
        },
      }
    ));

    table.refresh();
    this.close();
  },
});

watch(
  () => orderItemDialog.form.productModel,
  value => {
    orderItemDialog.form.price = null;
    orderItemDialog.form.inventory = null;
    if (!value) return;

    const { categoryId, productId } = productModels.value.find(
      x => x.value == value.value
    );
    orderItemDialog.form.category = categories.value.find(
      x => x.value == categoryId
    ).value;

    orderItemDialog.form.product = products.value.find(
      x => x.value == productId
    ).value;

    orderItemDialog.form.price = productModels.value.find(
      x => x.value == value.value
    )?.price;

    orderItemDialog.form.inventory = productModels.value.find(
      x => x.value == value.value
    )?.inventory;
  }
);

watch(
  () => orderItemDialog.form.category,
  value => {
    const { categoryId } =
      products.value.find(x => x.value == orderItemDialog.form.product) || {};
    if (categoryId != value) orderItemDialog.form.product = null;
  }
);

watch(
  () => orderItemDialog.form.product,
  value => {
    const { productId } =
      productModels.value.find(
        x => x.value == orderItemDialog.form.productModel.value
      ) || {};
    if (productId != value) orderItemDialog.form.productModel = null;
    if (!value) return;

    const { categoryId } = products.value.find(x => x.value == value);
    orderItemDialog.form.category = categories.value.find(
      x => x.value == categoryId
    ).value;
  }
);

const filteredProducts = computed(() => {
  if (!orderItemDialog.form.category) return products.value;
  return products.value?.filter(
    x => x.categoryId == orderItemDialog.form.category
  );
});

const filteredProductModels = computed(() => {
  if (!orderItemDialog.form.category && !orderItemDialog.form.product) {
    return productModels.value;
  }

  if (!orderItemDialog.form.product) {
    return productModels.value?.filter(
      x => x.categoryId == orderItemDialog.form.category
    );
  }

  return productModels.value?.filter(
    x => x.productId == orderItemDialog.form.product
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
  <v-text-field class="mb-2" placeholder="جستجو" v-model="search" />

  <v-data-table
    class="border"
    :headers="table.headers"
    :items="filteredItems"
    :items-per-page="table.itemsPerPage"
    :loading="table.loading"
  >
    <template #headers="{ columns, isSorted, getSortIcon, toggleSort }">
      <tr class="bg-grey-lighten-3">
        <template v-for="column in columns" :key="column.key">
          <th :class="{ 'text-center': column.align == 'center' }">
            <span class="fw-600 fs-14" @click="() => toggleSort(column)">{{
              column.title
            }}</span>
          </th>
        </template>
      </tr>
    </template>

    <template #item.id="{ item }">
      {{ toPersianDigit(item.id) }}
    </template>

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
      <div class="d-flex justify-center">
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
          :loading="item.postLoading"
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
      <v-card-title style="height: 50px" class="bg-grey-lighten-3">
        جزئیات سفارش {{ dialog.item.id }}
      </v-card-title>

      <v-divider class="border-opacity-25" color="black" />

      <v-card-text>
        <v-row>
          <v-col cols="auto">
            <data-label :value="dialog.item.fullName" />
          </v-col>

          <v-col
            cols="auto"
            v-for="item in table.headers.slice(2, -3)"
            :key="item.id"
          >
            <data-label
              style="direction: ltr"
              :title="item.title"
              :value="dialog.item[item.key]"
            />
          </v-col>

          <v-col cols="auto">
            <data-label title="زمان واریز">
              <span>{{
                toPersianDigit(
                  [dialog.item.month, "/", dialog.item.day].join("")
                )
              }}</span>
              <span class="mx-2"></span>
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
              :value="dialog.item.lastFourDigits"
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
          class="border mt-4"
          :headers="dialog.table.headers"
          :items="dialog.table.items"
          :items-per-page="dialog.table.itemsPerPage"
          density="compact"
          items-per-page="-1"
          show-expand
        >
          <template #bottom></template>

          <template #item.row="{ index }">{{ index + 1 }}</template>

          <!-- <template
            v-for="item in dialog.table.headers"
            #[`header.${item.key}`]="{ column }"
          >
            <div
              class="fw-600 fs-15 bg-grey-lighten-3 h-100 flex align-content-center mx-n2 px-2"
            >
              {{ column.title }}
            </div>
          </template> -->

          <template #headers="{ columns, isSorted, getSortIcon, toggleSort }">
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
          </template>

          <template #item.actions="{ item }">
            <v-btn color="primary" @click="orderItemDialog.open(item)">
              ویرایش
            </v-btn>
          </template>

          <template #expanded-row="{ item: { alternate } }">
            <tr>
              <td></td>
              <td>{{ alternate[0].product.name }}</td>
              <td>{{ alternate[0].weight.name }}</td>
              <td>{{ alternate[0].count }}</td>
              <td>{{ alternate[0].price }}</td>
              <td>{{ alternate[0].price * alternate[0].count }}</td>
              <td></td>
              <td></td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>

      <v-divider class="border-opacity-25" color="black" />

      <div
        style="height: 50px"
        class="d-flex px-4 py-2 flex-wrap align-center bg-grey-lighten-4"
      >
        <v-spacer />

        <v-btn
          v-if="['pending', 'rejected'].includes(dialog.item.status)"
          size="small"
          class="mx-2"
          color="green-lighten-4"
          text="تایید"
          flat
          :loading="dialog.item.isAcceptLoading"
          @click="
            () => {
              acceptOrder(dialog.item);
              dialog.close();
            }
          "
        />

        <v-btn
          v-if="['pending', 'preparation'].includes(dialog.item.status)"
          size="small"
          class="mx-2"
          color="red-lighten-4"
          text="رد"
          flat
          :loading="dialog.item.isRejectLoading"
          @click="
            () => {
              rejectOrder(dialog.item);
              dialog.close();
            }
          "
        />

        <v-btn
          size="small"
          class="mx-2"
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
      <v-card-title style="height: 50px" class="bg-grey-lighten-3">
        ویرایش آیتم سفارش
      </v-card-title>

      <v-divider class="border-opacity-25" color="black" />

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
                variant="outlined"
                :rules="[required]"
                clearable
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="orderItemDialog.form.product"
                :items="filteredProducts"
                label="محصول"
                variant="outlined"
                :rules="[required]"
                clearable
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="orderItemDialog.form.productModel"
                :items="filteredProductModels"
                label="مدل محصول"
                variant="outlined"
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
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="orderItemDialog.form.count"
                label="تعداد"
                variant="outlined"
                :rules="[required]"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                readonly
                v-model="orderItemDialog.form.totalPrice"
                label="قیمت کل"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                readonly
                v-model="orderItemDialog.form.inventory"
                label="موجودی"
                variant="outlined"
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
            size="small"
            class="mx-2"
            color="amber"
            text="ویرایش"
            type="submit"
            :loading="orderItemDialog.isSubmitLoading"
            flat
          />

          <v-btn
            size="small"
            class="mx-2"
            color="error"
            text="لغو"
            flat
            @click="orderItemDialog.close()"
          />
        </div>
      </custom-form>
    </v-card>
  </v-dialog>

  <v-dialog fullscreen v-model="printDialog.canBeShown">
    <v-card>
      <v-card-title style="height: 50px" class="bg-grey-lighten-3">
        پرینت
      </v-card-title>

      <v-divider class="border-opacity-25" color="black" />

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

      <v-divider class="border-opacity-25" color="black" />

      <div
        style="height: 50px"
        class="d-flex px-4 py-2 flex-wrap align-center bg-grey-lighten-4"
      >
        <v-spacer />

        <v-btn
          size="small"
          class="mx-2"
          color="error"
          text="لغو"
          flat
          @click="printDialog.close()"
        />
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
