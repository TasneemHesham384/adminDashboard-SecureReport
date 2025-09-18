// Helper function to get CSS variables
function getCssVar(variable) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
}

function getColors() {
  return {
    fontColor: getCssVar("--font-color"),
    secondryColor: getCssVar("--secondry-color"),
  };
}

let { fontColor, secondryColor } = getColors();

// chart (Bar)
const ctx = document.getElementById("reportsChart").getContext("2d");
const select = document.getElementById("scheduleSelect-box");

const chartData = {
  daily: {
    labels: [
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
      "الأحد",
    ],
    data: [3, 5, 2, 6, 4, 3, 5],
  },
  weekly: {
    labels: ["الأسبوع 1", "الأسبوع 2", "الأسبوع 3", "الأسبوع 4"],
    data: [12, 18, 9, 15],
  },
  monthly: {
    labels: [
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
    ],
    data: [40, 55, 30, 45, 60, 50, 40, 55, 30, 45, 60, 50],
  },
};

let reportsChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: chartData.daily.labels,
    datasets: [
      {
        label: "عدد البلاغات",
        data: chartData.daily.data,
        backgroundColor: "rgba(124, 58, 237, 0.7)",
        borderColor: "rgba(70, 47, 138, 1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(70, 47, 138, 1)",
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: fontColor },
      },
      tooltip: {
        backgroundColor: secondryColor,
        titleColor: fontColor,
        bodyColor: fontColor,
      },
    },
    interaction: {
      mode: "nearest",
      intersect: true,
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements[0] ? "pointer" : "default";
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "عدد البلاغات", color: fontColor },
        ticks: { color: fontColor },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      x: {
        title: { display: true, text: "الفترة", color: fontColor },
        ticks: { color: fontColor },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  },
});

select.addEventListener("change", () => {
  const value = select.value;
  reportsChart.data.labels = chartData[value].labels;
  reportsChart.data.datasets[0].data = chartData[value].data;
  reportsChart.update();
});

// Pie chart
const crimeLabels = [
  "سرقة",
  "اعتداء",
  "احتيال",
  "تخريب",
  "جريمة إلكترونية",
  "تحرش",
  "جريمة مخدرات",
  "أخرى",
];
const crimeCounts = [12, 9, 7, 5, 8, 4, 6, 3];

const crimeCtx = document.getElementById("crimePieChart").getContext("2d");

let crimePieChart = new Chart(crimeCtx, {
  type: "pie",
  data: {
    labels: crimeLabels,
    datasets: [
      {
        data: crimeCounts,
        backgroundColor: [
          "#fee146",
          "#90da3d",
          "#9333EA",
          "#A78BFA",
          "#ffffff",
          "#b198f6",
          "#462F8A",
          "#2E2250",
        ],
        borderColor: "#15161B",
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: { color: fontColor, font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: secondryColor,
        titleColor: fontColor,
        bodyColor: fontColor,
      },
    },
  },
});

// Map logic
const provinceIdMap = {
  Cairo: "EG-C",
  Alexandria: "EG-ALX",
  Giza: "EG-GZ",
  Aswan: "EG-ASN",
  Luxor: "EG-LX",
  Suez: "EG-SUZ",
  Ismailia: "EG-IS",
  PortSaid: "EG-PTS",
  Asuit: "EG-AST",
  Assiut: "EG-AST",
  Asyut: "EG-AST",
  AlBuḩayrah: "EG-BH",
  Beheira: "EG-BH",
  BanīSuwayf: "EG-BNS",
  BeniSuef: "EG-BNS",
  Daqahlīyah: "EG-DK",
  Dakahlia: "EG-DK",
  Dumyāţ: "EG-DT",
  Damietta: "EG-DT",
  AlFayyūm: "EG-FYM",
  Fayoum: "EG-FYM",
  AlGharbīyah: "EG-GH",
  Gharbia: "EG-GH",
  AlQalyūbīyah: "EG-KB",
  Qalyubia: "EG-KB",
  KafrElSheikh: "EG-KFS",
  "Kafr ash Shaykh": "EG-KFS",
  Qena: "EG-KN",
  Qinā: "EG-KN",
  Minya: "EG-MN",
  "Al Minyā": "EG-MN",
  Menoufia: "EG-MNF",
  Monufia: "EG-MNF",
  "Al Minūfīyah": "EG-MNF",
  Matrouh: "EG-MT",
  Maţrūḩ: "EG-MT",
  Sohag: "EG-SHG",
  Sūhāj: "EG-SHG",
  Sharqia: "EG-SHR",
  "Ash Sharqīyah": "EG-SHR",
  RedSea: "EG-BA",
  "Al Baḩr al Aḩmar": "EG-BA",
  NewValley: "EG-WAD",
  "Al Wādī al Jadīd": "EG-WAD",
  NorthSinai: "EG-SIN",
  "Shamāl Sīnā’": "EG-SIN",
  SouthSinai: "EG-JS",
  "Janūb Sīnā’": "EG-JS",
};

const reportData = {
  Cairo: 12,
  Alexandria: 5,
  Giza: 0,
  Aswan: 3,
  Luxor: 0,
  Suez: 2,
  Ismailia: 0,
  PortSaid: 1,
};

const mapSvg = document.getElementById("egypt-map");

Object.keys(reportData).forEach((province) => {
  const svgId = provinceIdMap[province];
  const element = document.getElementById(svgId);
  if (element) {
    element.style.opacity = reportData[province] > 0 ? 1 : 0.1;
  }
});

window.addEventListener("themeChanged", () => {
  const { fontColor, secondryColor } = getColors();

  reportsChart.options.plugins.legend.labels.color = fontColor;
  reportsChart.options.plugins.tooltip.backgroundColor = secondryColor;
  reportsChart.options.plugins.tooltip.titleColor = fontColor;
  reportsChart.options.plugins.tooltip.bodyColor = fontColor;
  reportsChart.options.scales.x.title.color = fontColor;
  reportsChart.options.scales.x.ticks.color = fontColor;
  reportsChart.options.scales.y.title.color = fontColor;
  reportsChart.options.scales.y.ticks.color = fontColor;
  reportsChart.update();

  crimePieChart.options.plugins.legend.labels.color = fontColor;
  crimePieChart.options.plugins.tooltip.backgroundColor = secondryColor;
  crimePieChart.options.plugins.tooltip.titleColor = fontColor;
  crimePieChart.options.plugins.tooltip.bodyColor = fontColor;
  crimePieChart.update();
});
