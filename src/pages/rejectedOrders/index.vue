<script setup>
import { toPersianDigit } from "@/utils/functions";
import axios from "@/axios";

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

const order = reactive({
  headers: [
    { title: "", key: "id", width: 40, sortable: false, align: "center" },
    { title: "نام و نام‌خانوادگی", key: "fullName" },
    { title: "شماره تماس", key: "phone" },
    { title: "زمان ثبت سفارش", key: "createdAt", align: "center" },
    { title: "وضعیت", key: "status", align: "center" },
    { title: "عملیات", key: "actions", align: "center" },
  ],
  page: 1,
  itemsPerPage: 10,
});

const filteredItems = computed(() => {
  return orders.value?.filter((x) =>
    [x.fullName, x.phone].some((y) => y.indexOf(search.value.trim()) > -1)
  );
});

const { data: orders, isPending: isLoading_orders } = useQuery({
  queryKey: ["rejectedOrders"],
  queryFn: () =>
    axios.get("orders", {
      params: {
        status: "rejected",
      },
    }),
});

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

const search = ref("");
</script>

<template>
  <!-- <v-text-field class="mb-2" placeholder="جستجو" v-model="search" /> -->

  <v-data-table
    :headers="order.headers"
    :items="filteredItems"
    :page="order.page"
    :items-per-page="order.itemsPerPage"
    :page-text="`صفحه ${toPersianDigit(order.page)} از ${toPersianDigit(
      Math.ceil(filteredItems?.length / order.itemsPerPage)
    )}`"
    :loading="isLoading_orders"
    :hide-default-footer="!filteredItems?.length || isLoading_orders"
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
        <v-btn color="primary" text="جزئیات" @click="dialog.open(item)" />
      </div>
    </template>
  </v-data-table>

  <v-dialog v-model="dialog.canBeShown">
    <v-card min-height="500px">
      <v-card-title> جزئیات سفارش {{ dialog.item.id }} </v-card-title>

      <v-card-text>
        {{ dialog.name }}
        <v-row>
          <v-col cols="auto">
            <data-label :value="dialog.item.fullName" />
          </v-col>

          <v-col
            cols="auto"
            v-for="item in order.headers.slice(2, -3)"
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
          class="mt-4"
          :headers="dialog.table.headers"
          :items="dialog.table.items"
          items-per-page="-1"
          show-expand
        >
          <template #bottom></template>

          <template #item.row="{ index }">{{ index + 1 }}</template>

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
              rounded="full"
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
            </tr>
          </template>
        </v-data-table>
      </v-card-text>

      <div style="height: 72px" class="d-flex px-4 py-2 flex-wrap align-center">
        <v-spacer />

        <v-btn
          height="40"
          class="mx-2"
          color="primary"
          text="بستن"
          flat
          @click="dialog.close()"
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
