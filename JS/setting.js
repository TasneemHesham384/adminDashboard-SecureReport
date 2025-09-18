// document.addEventListener("DOMContentLoaded", function () {
//   // حفظ الإعدادات
//   function saveSetting(key, value) {
//     localStorage.setItem(key, JSON.stringify(value));
//   }

//   function loadSetting(key, defaultValue = null) {
//     const stored = localStorage.getItem(key);
//     return stored ? JSON.parse(stored) : defaultValue;
//   }

//   // تطبيق الثيم
//   function applyTheme(theme) {
//     if (theme === "فاتح") {
//       document.documentElement.classList.add("light");
//     } else {
//       document.documentElement.classList.remove("light");
//     }
//   }

//   // تطبيق الخط
//   function applyFont(font) {
//     document.body.style.fontFamily = font;
//   }

//   // تطبيق اللون الأساسي
//   function applyPrimaryColor(color) {
//     document.documentElement.style.setProperty("--purple", color);
//   }

//   // تطبيق اللغة (نموذج بسيط)
//   function applyLanguage(lang) {
//     document.documentElement.setAttribute("lang", lang === "English" ? "en" : "ar");
//     // لو عندك نظام ترجمة، هنا يتم تحميل ملف اللغة المناسب
//   }

//   // تطبيق المنطقة الزمنية (عرض فقط، مش تغيير فعلي)
//   function applyTimezone(timezone) {
//     const now = new Date().toLocaleString("en-US", { timeZone: timezone });
//     console.log("الوقت الحالي حسب المنطقة:", now);
//   }

//   // استرجاع الإعدادات وتطبيقها
//   const savedTheme = loadSetting("appearance_theme", "داكن");
//   const savedFont = loadSetting("appearance_font", "Segoe UI");
//   const savedColor = loadSetting("appearance_color", "#316AFF");
//   const savedLang = loadSetting("system_lang", "العربية");
//   const savedTimezone = loadSetting("system_timezone", "Africa/Cairo");

//   applyTheme(savedTheme);
//   applyFont(savedFont);
//   applyPrimaryColor(savedColor);
//   applyLanguage(savedLang);
//   applyTimezone(savedTimezone);

//   // حفظ إعدادات المظهر
//   const appearanceForm = document.querySelector("#appearance form");
//   appearanceForm.addEventListener("submit", function (e) {
//     e.preventDefault();
//     const theme = appearanceForm.querySelector("select").value;
//     const font = appearanceForm.querySelectorAll("select")[1].value;
//     const color = appearanceForm.querySelector('input[type="color"]').value;

//     saveSetting("appearance_theme", theme);
//     saveSetting("appearance_font", font);
//     saveSetting("appearance_color", color);

//     applyTheme(theme);
//     applyFont(font);
//     applyPrimaryColor(color);

//     alert("تم حفظ إعدادات المظهر");
//   });

//   // حفظ إعدادات النظام
//   const systemForm = document.querySelector("#system form");
//   systemForm.addEventListener("submit", function (e) {
//     e.preventDefault();
//     const lang = systemForm.querySelector("select").value;
//     const timezone = systemForm.querySelectorAll("select")[1].value;

//     saveSetting("system_lang", lang);
//     saveSetting("system_timezone", timezone);

//     applyLanguage(lang);
//     applyTimezone(timezone);

//     alert("تم تحديث إعدادات النظام");
//   });

//   // حفظ إعدادات الحساب
//   const accountForm = document.querySelector("#account form");
//   accountForm.addEventListener("submit", function (e) {
//     e.preventDefault();
//     const name = accountForm.querySelector('input[type="text"]').value;
//     const email = accountForm.querySelector('input[type="email"]').value;

//     saveSetting("account_name", name);
//     saveSetting("account_email", email);

//     alert("تم حفظ إعدادات الحساب");
//   });

//   // حفظ إعدادات الخصوصية
//   const privacyForm = document.querySelector("#privacy form");
//   privacyForm.addEventListener("submit", function (e) {
//     e.preventDefault();
//     const visibility = privacyForm.querySelector("select").value;
//     const tracking = privacyForm.querySelector("#activityTracking").checked;
//     const contact = privacyForm.querySelector("#contactPermission").checked;

//     saveSetting("privacy_visibility", visibility);
//     saveSetting("privacy_tracking", tracking);
//     saveSetting("privacy_contact", contact);

//     alert("تم حفظ إعدادات الخصوصية");
//   });

//   // حفظ إعدادات الإشعارات
//   const notificationsForm = document.querySelector("#notifications form");
//   notificationsForm.addEventListener("submit", function (e) {
//     e.preventDefault();
//     const email = notificationsForm.querySelector("#emailNoti").checked;
//     const push = notificationsForm.querySelector("#pushNoti").checked;
//     const sms = notificationsForm.querySelector("#smsNoti").checked;

//     saveSetting("noti_email", email);
//     saveSetting("noti_push", push);
//     saveSetting("noti_sms", sms);

//     alert("تم تحديث إعدادات الإشعارات");
//   });
// });
