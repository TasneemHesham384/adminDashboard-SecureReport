const night = document.querySelector(".night");
const closeNav = document.querySelector(".logo i");
const sidebar = document.querySelector(".sidebar");
const scheduleSelect = document.getElementById("scheduleSelect");
dateOutput = document.querySelector(".schedule-picker .output");

// get dark or ligt theme from local storage
const isLight = localStorage.getItem("theme") === "true";
if (isLight) {
  document.documentElement.classList.add("light");
  document.querySelector(".night")?.classList.add("active");
}

const days = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const months = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

// handle night mode toggle
night.addEventListener("click", () => {
  const isLight = document.documentElement.classList.toggle("light");
  night.classList.toggle("active", isLight);
  window.localStorage.setItem("theme", isLight);
  window.dispatchEvent(
    new CustomEvent("themeChanged", {
      detail: { isLight },
    })
  );
});

// close nav bar

function updateDateOutput(value) {
  let today = new Date();
  let day = today.getDate();
  let month = today.getMonth();
  let year = today.getFullYear();

  if (value === "weekly") {
    let prevWeek = new Date(year, month, day - 7);
    dateOutput.innerHTML = `${prevWeek.getDate()} ${
      months[prevWeek.getMonth()]
    } - ${day} ${months[month]}`;
  } else if (value === "daily") {
    dateOutput.innerHTML = `${day} ${months[month]} ${year}`;
  } else if (value === "monthly") {
    let prevMonthDate = new Date(year, month - 1, day);
    dateOutput.innerHTML = `${prevMonthDate.getDate()} ${
      months[prevMonthDate.getMonth()]
    }  - ${day} ${months[month]}`;
  }
}
scheduleSelect.onchange = function (e) {
  updateDateOutput(e.target.value);
};

window.addEventListener("DOMContentLoaded", function () {
  updateDateOutput(scheduleSelect.value);
});

let neww = document.querySelector(".new-reports h4");
let all = document.querySelector(".all-reports h4");
const notiSound = document.querySelector(".noti");
let notificationPopup = document.querySelector(".notification-popup");

// setInterval(() => {
//   neww.innerHTML = parseInt(neww.innerHTML) + 1;
//   all.innerHTML = parseInt(all.innerHTML) + 1;
//   document.querySelector(".notification").classList.add("show-after");
//   notificationPopup.style.display = "block";
//   notificationPopup.classList.add("show-after");

//   notiSound.play();
// }, 20000);

