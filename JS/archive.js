function displayTable(paginatedItems) {
  const tbody = document.querySelector("table tbody");
  tbody.innerHTML = "";

  paginatedItems.forEach((report) => {
    tbody.innerHTML += `
      <tr>
        <th scope="row" class="id">${report.id}</th>
        <td>${report.report_type}</td>
        <td>${report.location}</td>
        <td>${report.contact_info}</td>
        <td>${report.incident_date}</td>
        <td class="status">
         <span class="status-indicator ${
           report.status === "تم الحل"
             ? "active"
             : report.status === "تم الغلق"
             ? "inactive"
             : ""
         }"></span>
  ${report.status}
       </td>

        <td>
          <button class=" btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#reportModal${
            report.id
          }">
            عرض المزيد
          </button>

          <div class="modal fade" id="reportModal${
            report.id
          }" tabindex="-1" aria-labelledby="reportModalLabel${
      report.id
    }" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
              <div class="modal-content">
                <div class="modal-header p-3">
                  <h5 class="modal-title" id="reportModalLabel${
                    report.id
                  }">تفاصيل البلاغ #${report.id}</h5>
                </div>
                <div class="modal-body p-3 text-white-100">
                  <p><strong>نوع البلاغ:</strong> ${report.report_type}</p>
                  <p><strong>العنوان:</strong> <a href="${
                    report.location_link
                  }" target="_blank">${report.location}</a></p>
                  <p><strong>التاريخ:</strong> ${report.incident_date}</p>
                  <p><strong>معلومات الاتصال:</strong> ${
                    report.contact_info
                  }</p>
                  <p><strong>حالة البلاغ:</strong> ${report.status}</p>

                  <hr>
                  <p><strong>تفاصيل البلاغ:</strong> ${
                    report.report_details
                  }</p>
                  
                  <hr>
                  <p><strong>معلومات الجناة:</strong></p>
                  <ul>
                    ${report.criminal_infos
                      .map(
                        (c) =>
                          `<li>${c.name} - ${c.description} ${
                            c.other_info ? "- " + c.other_info : ""
                          }</li>`
                      )
                      .join("")}
                  </ul>
                  
                  <hr>
                  <p><strong>المرفقات:</strong></p>
                  <ul>
                    ${report.attachments
                      .map((a) =>
                        a.file
                          ? `<li><a href="${a.file}" target="_blank">📎 ملف</a></li>`
                          : a.audio_recording
                          ? `<li><a href="${a.audio_recording}" target="_blank">🎤 تسجيل صوتي</a></li>`
                          : ""
                      )
                      .join("")}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  });

  //   handle active
  filterSearch();
  handleActive();
}

fetch("archive.json")
  .then((res) => res.json())
  .then((data) => {
    const reports = Object.values(data.reports);
    displayTable(reports);
    filterRows();
  })
  .catch((err) => console.log(err));

//   handle active
function handleActive() {
  let alltd = document.querySelectorAll(".status");
  alltd.forEach((td) => {
    const text = td.textContent.trim();

    if (text.includes("تم الحل")) {
      td.querySelector(".status-indicator").classList.add("active");
    } else if (text.includes("تم الغلق")) {
      td.querySelector(".status-indicator").classList.add("inactive");
    }
  });
}

function filterRows() {
  let select = document.querySelector("select");
  let selected = select.value;
  let allRows = document.querySelectorAll("tbody tr");

  allRows.forEach((row) => {
    let status = row.querySelector(".status-indicator");
    if (!status) return;

    if (selected === "الكل") {
      row.style.display = "";
    } else if (selected === "تم الحل") {
      row.style.display = status.classList.contains("active") ? "" : "none";
    } else if (selected === "تم الإغلاق") {
      row.style.display = status.classList.contains("inactive") ? "" : "none";
    }
  });
}

document.querySelector("select").addEventListener("change", filterRows);

// search for report
let search = document.querySelector(".table-filter .search input");

function filterSearch() {
  search.addEventListener("input", function (e) {
    e.preventDefault();
    let result = search.value.trim().toLowerCase();
    let allRows = document.querySelectorAll("tbody tr");
    allRows.forEach((row) => {
      let id = row.querySelector(".id").textContent.toLowerCase();
      if (id.includes(result)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
}

// export to excel
function exportToExcel() {
  const table = document.querySelector("table");
  const rows = Array.from(table.querySelectorAll("tbody tr"));

  const data = rows.map((row) => {
    const cells = row.querySelectorAll("td, th");
    const id = cells[0].textContent.trim();
    const type = cells[1].textContent.trim();
    const location = cells[2].textContent.trim();
    const contact = cells[3].textContent.trim();
    const dateText = cells[4].textContent.trim();
    const status = cells[5].textContent.trim();

    const [day, month, year] = dateText.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    return [
      { v: id },
      { v: type },
      { v: location },
      { v: contact },
      { v: date, t: "d" },
      { v: status },
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([
    ["ID", "نوع البلاغ", "العنوان", "الاتصال", "التاريخ", "الحالة"],
    ...data,
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "البلاغات");

  const date = new Date().toLocaleDateString("ar-EG").replace(/\//g, "-");
  XLSX.writeFile(workbook, `بلاغات_${date}.xlsx`);
}

// export to pdf
async function exportReportsToPDF() {
  const tableClone = document.createElement("table");
  tableClone.className = "pdf-table";
  tableClone.style.width = "100%";
  tableClone.style.borderCollapse = "collapse";
  tableClone.style.fontSize = "12px";
  tableClone.style.direction = "rtl";
  tableClone.style.background = "white";
  tableClone.style.color = "black";

  const rows = document.querySelectorAll("table tbody tr");
  const rowData = Array.from(rows).map((row) => {
    const cells = row.querySelectorAll("td, th");
    return {
      id: cells[0].textContent.trim(),
      report_type: cells[1].textContent.trim(),
      location: cells[2].textContent.trim(),
      contact_info: cells[3].textContent.trim(),
      incident_date: cells[4].textContent.trim(),
      status: cells[5].textContent.trim(),
    };
  });
  tableClone.innerHTML = `
  <thead>
    <tr style="background:black; color:white;">
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">رقم البلاغ</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">نوع البلاغ</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">العنوان</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">الاتصال</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">التاريخ</th>
      <th style="border:1px solid #ccc; padding:4px; color:white !important; background:black !important;">الحالة</th>
    </tr>
  </thead>
  <tbody>
    ${rowData
      .map(
        (r) => `<tr style="background:white; color:black;">
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            r.id
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            r.report_type
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            r.location
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            r.contact_info
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            r.incident_date
          )}</td>
          <td style="border:1px solid #ccc; padding:4px; color:black !important; background:white !important;">${escapeHtml(
            r.status
          )}</td>
        </tr>`
      )
      .join("")}
  </tbody>
`;

  document.body.appendChild(tableClone);

  try {
    const canvas = await html2canvas(tableClone, {
      scale: 1.5,
      backgroundColor: "#fff",
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jspdf.jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 10;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 5, 10, imgWidth, imgHeight);
    const date = new Date().toLocaleDateString("ar-EG").replace(/\//g, "-");
    pdf.save(`بلاغات_${date}.pdf`);
  } catch (err) {
    console.error("خطأ في تصدير الـ PDF:", err);
  } finally {
    document.body.removeChild(tableClone);
  }
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.toString().replace(/[&<>"']/g, (m) => map[m]);
}
