const rowPerPage = 10;
let currentPage = 1;
let reports = [];
let filteredReports = []; // علشان الفلترة + البحث يشتغلوا مع بعض

const statusMap = {
  "تم استلام البلاغ": "new",
  "قيد المراجعة": "review",
  "قيد المعالجة": "process",
  "تم الحل": "solved",
  "تم الإغلاق": "closed",
};

// ========== Display Table ==========
function displayTable(page, data) {
  const start = (page - 1) * rowPerPage;
  const end = start + rowPerPage;
  const paginatedItems = data.slice(start, end);

  const tbody = document.querySelector("table tbody");
  let rowsHTML = "";

  paginatedItems.forEach((report) => {
    const currentClass = statusMap[report.status] || "";
    const statusOptions = Object.keys(statusMap);

    const dropdown = `
      <div class="dropdown reportStatus">
        <button class="btn btn-secondary dropdown-toggle ${currentClass}" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          ${report.status || "اختر الحالة"}
        </button>
        <ul class="dropdown-menu">
          ${statusOptions
            .map(
              (status) => `
            <li>
              <a class="dropdown-item ${statusMap[status]} ${
                report.status === status ? "active" : ""
              }" href="#">${status}</a>
            </li>`
            )
            .join("")}
        </ul>
      </div>
    `;

    const modal = `
      <div class="modal fade" id="reportModal${
        report.id
      }" tabindex="-1" aria-labelledby="reportModalLabel${
      report.id
    }" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header d-flex justify-content-between align-items-center flex-row-reverse">
              <h5 class="modal-title" id="reportModalLabel${
                report.id
              }">تفاصيل البلاغ #${report.id}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-start">
              <p><strong>نوع البلاغ:</strong> ${report.report_type}</p>
              <p><strong>العنوان (google maps):</strong> <a href="${
                report.location_link
              }" target="_blank">${report.location}</a></p>
              <p><strong>التاريخ:</strong> ${report.incident_date}</p>
              <p><strong>معلومات الاتصال:</strong> ${report.contact_info}</p>
              <p><strong>حالة البلاغ:</strong> ${report.status}</p>
              <hr>
              <p><strong>تفاصيل البلاغ:</strong> ${report.report_details}</p>
              <hr>
              <p><strong>معلومات الجناة:</strong></p>
              <ul>
                ${
                  report.criminal_infos?.length
                    ? report.criminal_infos
                        .map(
                          (c) =>
                            `<li>${c.name} - ${c.description} ${
                              c.other_info ? "- " + c.other_info : ""
                            }</li>`
                        )
                        .join("")
                    : "<li>لا يوجد معلومات</li>"
                }
              </ul>
              <hr>
              <p><strong>المرفقات:</strong></p>
              <ul>
                ${
                  report.attachments?.length
                    ? report.attachments
                        .map((a) =>
                          a.file
                            ? `<li><a href="${a.file}" target="_blank">${a.file}</a></li>`
                            : a.audio_recording
                            ? `<li><a href="${a.audio_recording}" target="_blank">${a.audio_recording}</a></li>`
                            : ""
                        )
                        .join("")
                    : "<li>لا يوجد مرفقات</li>"
                }
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    rowsHTML += `
      <tr>
        <th scope="row" class="id">${report.id}</th>
        <td>${report.report_type}</td>
        <td>${report.location}</td>
        <td>${report.contact_info}</td>
        <td>${report.incident_date}</td>
        <td>${dropdown}</td>
        <td>
          <button class="btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#reportModal${report.id}">عرض المزيد</button>
          ${modal}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHTML;

  reportStatus(); // لازم بعد ما يرسم الجدول
}

// ========== Report Status ==========
function reportStatus() {
  document.querySelectorAll(".reportStatus").forEach((dropdown) => {
    const button = dropdown.querySelector("button");
    dropdown.querySelectorAll("ul li a").forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        dropdown
          .querySelectorAll("a")
          .forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
        button.textContent = this.textContent;

        button.classList.remove("new", "review", "process", "solved", "closed");
        button.classList.add(this.classList[1]);

        const reportId = button.closest("tr").querySelector(".id").textContent;
        updateReportStatus(reportId, this.textContent);
      });
    });
  });
}

// ========== Fetch Data ==========
fetch("report.json")
  .then((res) => res.json())
  .then((data) => {
    reports = Object.values(data.reports);
    filteredReports = reports; 
    displayTable(currentPage, filteredReports);
    pagination(filteredReports.length);
    setupFilters();
    setupSearch();
  })
  .catch((err) => console.log(err));

// ========== Pagination ==========
function pagination(reportsCount) {
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";
  const pageCount = Math.ceil(reportsCount / rowPerPage);

  // prev3
  let prev3 = createPageItem("&laquo;");
  pagination.appendChild(prev3);

  // prev
  let prev = createPageItem("&lsaquo;");
  pagination.appendChild(prev);

  let pageItems = [];
  for (let i = 1; i <= pageCount; i++) {
    let li = createPageItem(i);
    pagination.appendChild(li);
    pageItems.push(li);

    li.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      displayTable(currentPage, filteredReports);
      showLi(currentPage);
      updateControls();
    });
  }

  // next
  let next = createPageItem("&rsaquo;");
  pagination.appendChild(next);

  // next3
  let next3 = createPageItem("&raquo;");
  pagination.appendChild(next3);

  function createPageItem(content) {
    let li = document.createElement("li");
    li.className = "page-item";
    li.innerHTML = `<a class="page-link" href="#">${content}</a>`;
    return li;
  }

  function showLi(pageNumber) {
    let start = Math.floor((pageNumber - 1) / 3) * 3;
    let end = start + 3;
    pageItems.forEach((li, index) => {
      li.style.display = index >= start && index < end ? "" : "none";
      li.classList.toggle("active", index + 1 === pageNumber);
    });
  }

  function updateControls() {
    prev3.classList.toggle("disabled", currentPage <= 3);
    prev.classList.toggle("disabled", currentPage === 1);
    next.classList.toggle("disabled", currentPage === pageCount);
    next3.classList.toggle("disabled", currentPage >= pageCount - 2);
  }

  // Controls
  prev3.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 3) {
      currentPage = Math.max(1, currentPage - 3);
      displayTable(currentPage, filteredReports);
      showLi(currentPage);
      updateControls();
    }
  });

  prev.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      displayTable(currentPage, filteredReports);
      showLi(currentPage);
      updateControls();
    }
  });

  next.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < pageCount) {
      currentPage++;
      displayTable(currentPage, filteredReports);
      showLi(currentPage);
      updateControls();
    }
  });

  next3.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < pageCount - 2) {
      currentPage = Math.min(pageCount, currentPage + 3);
      displayTable(currentPage, filteredReports);
      showLi(currentPage);
      updateControls();
    }
  });

  showLi(currentPage);
  updateControls();
}

// ========== Filters ==========
function setupFilters() {
  const select = document.querySelector("select");
  select.addEventListener("change", function () {
    const selected = select.value;
    if (selected === "الكل") {
      filteredReports = reports;
    } else if (selected === "المستلمة") {
      filteredReports = reports.filter((r) => statusMap[r.status] === "new");
    } else if (selected === "قيد المراجعة") {
      filteredReports = reports.filter((r) => statusMap[r.status] === "review");
    } else if (selected === "قيد المعالجة") {
      filteredReports = reports.filter(
        (r) => statusMap[r.status] === "process"
      );
    } else if (selected === "المحلولة") {
      filteredReports = reports.filter((r) => statusMap[r.status] === "solved");
    } else if (selected === "المغلقة") {
      filteredReports = reports.filter((r) => statusMap[r.status] === "closed");
    }
    currentPage = 1;
    displayTable(currentPage, filteredReports);
    pagination(filteredReports.length);
  });
}

// ========== Search ==========
function setupSearch() {
  const searchInput = document.querySelector(".table-filter .search input");
  searchInput.addEventListener("input", function () {
    const keyword = this.value.trim().toLowerCase();
    filteredReports = reports.filter((report) =>
      report.id.toString().toLowerCase().includes(keyword)
    );
    currentPage = 1;
    displayTable(currentPage, filteredReports);
    pagination(filteredReports.length);
  });
}

// ========== Update Status Backend ==========
function updateReportStatus(id, newStatus) {
  fetch(`/api/reports/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  })
    .then((res) => res.json())
    .then((data) => console.log("تم التحديث:", data))
    .catch((err) => console.error("خطأ في التحديث:", err));
}
