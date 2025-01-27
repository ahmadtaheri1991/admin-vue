export const useAuthStore = defineStore("authStore", {
  state: () => ({
    token: null,
    refreshToken: null,
  }),

  getters: {},

  actions: {
    setToken(token) {
      this.token = token;
    },

    setRefreshToken(refreshToken) {
      this.refreshToken = refreshToken;
    },
  },

  persist: true,
});
