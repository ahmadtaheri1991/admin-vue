<script setup>
import { required } from "@/utils/formRules";
import axios from "@/axios";

const router = useRouter();
const appStore = useAppStore();
const authStore = useAuthStore();

if (authStore.accessToken) router.push("/");

const form = reactive({
  username: "",
  password: "",
});
const showPassword = ref(false);

function togglePassword() {
  showPassword.value = !showPassword.value;
}

const { mutate, isPending } = useMutation({
  mutationFn: (body) => axios.post("login", body),
  onSuccess: (data) => {
    authStore.setAccessToken(data.accessToken);
    authStore.setRefreshToken(data.refreshToken);
    router.push("/");
  },
  onError: (error) => {
    console.log(error);
    const { data } = error.response;
    if (data.message) appStore.openAlert(2, data.message);
    else appStore.openAlert(2, "عملیات با خطا مواجه شد");
  },
});

function login() {
  const { username, password } = form;
  mutate({ username, password });
}
</script>

<template>
  <div
    class="
      bg-green-darken-4
      pa-2
      pt-4
      width-120
      height-120
      mx-auto
      rounded-circle
    "
  >
    <v-img src="/images/logo-maze.png" />
  </div>

  <v-card class="mx-auto mt-7 border" flat max-width="500">
    <custom-form @valid="login">
      <v-card-title> ورود به پنل مدیریت </v-card-title>

      <v-card-text class="py-2 px-6">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.username"
              label="نام کاربری"
              :rules="[required]"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="form.password"
              label="رمز عبور"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="
                showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
              "
              @click:append-inner="togglePassword"
              :rules="[required]"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <div style="height: 72px" class="d-flex px-6 py-4 flex-wrap align-center">
        <v-spacer />

        <v-submit-btn type="submit" :loading="isPending" text="ورود" />
      </div>
    </custom-form>
  </v-card>
</template>
