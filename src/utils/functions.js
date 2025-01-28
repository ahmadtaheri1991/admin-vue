import Swal from "sweetalert2";

export function toPersianDigit(value) {
  return value
    ?.toString()
    .replace(/\d/g, (x) => String.fromCharCode(x.charCodeAt(0) + 1728));
}

export function toPersianNumber(number) {
  const enNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const faNumbers = ["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۰"];
  return enNumbers.reduce(
    (cum, n, i) => cum.replaceAll(n, faNumbers[i]),
    String(number)
  );
}

export function toEnglishNumber(number) {
  const enNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const faNumbers = ["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۰"];
  return faNumbers.reduce(
    (cum, n, i) => cum.replaceAll(n, enNumbers[i]),
    String(number)
  );
}

export function numberWithCommas(x, defaultReturnValue = "0") {
  if (x == null || x == undefined) return defaultReturnValue;
  return x
    .toString()
    .replaceAll(",", "")
    .replace(/\B(?=(.{3})+(?!.))/g, ",")
    .replace(/^,/, "");
}

export function numberWithoutCommas(x, defaultReturnValue = "0") {
  if (x == null || x == undefined) return defaultReturnValue;
  return x.toString().replaceAll(",", "");
}

export function toShamsi(dateStr, returnIfNotDate = "") {
  const date = new Date(dateStr);
  if (date.toString() == "Invalid Date") return returnIfNotDate;
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function toShamsiDatetime(dateStr, returnIfNotDate) {
  const date = new Date(dateStr);
  if (date.toString() == "Invalid Date") return returnIfNotDate;
  return date
    .toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .split(",")
    .reverse()
    .join(" ");
}

export function scrollToTop() {
  window.scrollTo(0, 0);
}

export function areYouSure(title, confirmButtonText, cancelButtonText) {
  return Swal.fire({
    icon: "question",
    text: title || "آیا مطمئن هستید؟",
    confirmButtonText: confirmButtonText || "بله",
    confirmButtonColor: "#05b105",
    showCancelButton: true,
    cancelButtonText: cancelButtonText || "خیر",
    cancelButtonColor: "#B00020",
  });
}

export async function download(url, filename) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
    xhr.onload = function () {
      if (xhr.status != 200) {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(this.response);
        a.download = filename;
        a.click();
        resolve();
        URL.revokeObjectURL(a.href);
      }
    };
    xhr.onerror = reject;
  });
}

export async function validateForm(formRef) {
  const { valid } = await formRef.validate();
  if (!valid) throw new Error("Form validation failed");
}

export function sumByKey(array, key) {
  return array.reduce(
    (acc, cur) => acc + +(cur[key] + "").replaceAll(",", ""),
    0
  );
}
