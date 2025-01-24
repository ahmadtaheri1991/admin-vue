export const useAuthStore = defineStore("authStore", {
  state: () => ({
    token: null,
  }),

  getters: {},

  actions: {
    setToken(token) {
      this.token = token;
    },
  },

  persist: true,
});
