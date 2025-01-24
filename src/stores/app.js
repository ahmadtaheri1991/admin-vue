const ALERT_COLORS = { success: "success", warning: "warning", error: "error" };
const ALERT_MODES = ["success", "warning", "error"];

export const useAppStore = defineStore("appStore", {
  state: () => ({
    alert: {
      canBeShown: false,
      mode: null, // 0: success, 1: warning, 2: error
      color: null,
      text: "",
    },
  }),

  getters: {},

  actions: {
    openAlert(mode, text) {
      this.alert.canBeShown = true;
      this.alert.color = ALERT_COLORS[ALERT_MODES[mode]];
      this.alert.text = text;
    },

    closeAlert() {
      this.alert.canBeShown = false;
    },
  },
});
