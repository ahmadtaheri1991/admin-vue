export const useAuthStore = defineStore("authStore", {
  state: () => ({
    accessToken: null,
    refreshToken: null,
  }),

  getters: {},

  actions: {
    setAccessToken(accessToken) {
      this.accessToken = accessToken;
    },

    setRefreshToken(refreshToken) {
      this.refreshToken = refreshToken;
    },

    unsetTokens() {
      this.accessToken = null;
      this.refreshToken = null;
    },
  },

  persist: true,
});
