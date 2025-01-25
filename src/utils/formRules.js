function validator(test, text) {
  return (value) => {
    if (["", null, undefined].includes(value)) return true;
    return test(value) || text;
  };
}

function arrayValidator(test, text) {
  return (value) => {
    if (!value.length) return true;
    return test(value) || text;
  };
}

export const required = (value) =>
  !["", null, undefined].includes(value) || "الزامی";

export const requiredIf = (condition) => (value) =>
  !condition || !["", null, undefined].includes(value) || "الزامی";

export const requiredArray = (value) =>
  (value != null && value.length > 0) || "الزامی";

export const length = (length) =>
  validator((value) => value.length == length, `${length} کاراکتری باشد`);

export const minLength = (length) =>
  validator((value) => value.length >= length, `حداقل ${length} کاراکتری باشد`);

export const maxLength = (length) =>
  validator(
    (value) => value.length <= length,
    `حداکثر ${length} کاراکتری باشد`
  );

export const sameAs = (val, ref) =>
  validator((value) => value === val, `مثل ${ref} باشد`);

export const minValue = (val, ref) =>
  validator((value) => value >= val, `نباید کمتر از ${ref || val} باشد`);

export const greaterThan = (val, ref) =>
  validator(
    (value) => value.replaceAll(",", "") > val,
    `باید بزرگتر از ${ref || val} باشد`
  );

export const containLowercase = validator(
  (value) => /[a-z]/.test(value),
  "شامل حروف کوچک انگلیسی باشد"
);

export const containUppercase = validator(
  (value) => /[A-Z]/.test(value),
  "شامل حروف بزرگ انگلیسی باشد"
);

export const containDigit = validator(
  (value) => /\d/.test(value),
  "شامل اعداد باشد"
);

export const containSpecialCharacter = validator(
  (value) => /[~!@#$%^&*()['"+-.,; \/:<=>?{}|`_]/.test(value),
  "شامل کاراکترهای خاص باشد"
);

export const startWith = (val) => {
  if (Array.isArray(val)) {
    return validator(
      (value) => new RegExp(`^(${val.join("|")})`).test(value || ""),
      `با ${val.join(" یا ")} شروع شود`
    );
  } else {
    return validator(
      (value) => (value || "").startsWith(val),
      `با ${val} شروع شود`
    );
  }
};

export const fileSize = (size, scale = "MB") => {
  const maxSize = size * 10 ** (scale == "kB" ? 3 : 6);
  return arrayValidator(
    (value) => value[0].size <= maxSize,
    `حداکثر حجم قابل بارگذاری ${size} ${scale} است`
  );
};

export const fileType = (type) => {
  if (Array.isArray(type)) {
    return arrayValidator(
      (value) => new RegExp(`\\.(${type.join("|")})$`).test(value[0].name),
      `فرمت فایل ${type.join(" یا ")} باشد`
    );
  } else {
    return arrayValidator(
      (value) => value[0].name.endsWith("." + type),
      `فرمت فایل ${type} باشد`
    );
  }
};

export const nationalCode = validator((value) => {
  if (value.length != 10) return false;
  if (new Set(value).size == 1) return false; // it can't be 0000000000 or 1111111111 or ... or 9999999999

  const lastChar = +value[9];
  const productSum = value
    .split("")
    .slice(0, -1)
    .map((n, i) => n * (10 - i))
    .reduce((acc, x) => acc + x);
  const r = productSum % 11;

  return lastChar == ([0, 1].includes(r) ? r : 11 - r);
}, "کد ملی نامعتبر می باشد!");
