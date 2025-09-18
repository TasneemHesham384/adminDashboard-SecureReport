// ======== config ========
const rowsPerPage = 20;
let currentPage = 1;
let users = []; // المصدر الأصلي
let filteredUsers = []; // المصدر المعروض (بعد فلتر/بحث)

// ======== DOM refs (cached) ========
const tbody = document.querySelector("#userTable");
const paginationEl = document.querySelector(".pagination");
const selectFilter = document.querySelector(".table-filter select");
const searchInput = document.querySelector(".table-filter .search input");
const confirmDeleteBtn = document.querySelector("#confirmDelete");
const confirmAddBtn = document.querySelector(".confirmAdd");

// ======== load users (fetch) ========
async function loadUsers(url = "users.json") {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("فشل تحميل الملف: " + res.status);
    const data = await res.json();
    users = Array.isArray(data) ? data : data.users || [];
    filteredUsers = users.slice();
    currentPage = 1;
    render();
    setupFilters();
    setupSearch();
  } catch (err) {
    console.error("خطأ في loadUsers:", err);
  }
}

// ======== render (table + pagination) ========
function render() {
  displayTable(currentPage);
  setupPagination();
}

// displayTable now uses filteredUsers
function displayTable(page = 1) {
  currentPage = page;
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedItems = filteredUsers.slice(start, end);

  let rowsHTML = "";
  paginatedItems.forEach((user) => {
    rowsHTML += `
      <tr data-email="${user.email}">
        <td class="userName">${escapeHtml(user.name)}</td>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.role)}</td>
        <td class="status">
          <span class="status-indicator ${user.status.toLowerCase()}"></span>
          ${escapeHtml(user.status)}
        </td>
        <td>${escapeHtml(user.createdAt)}</td>
        <td>
          <div class="dropdown">
            <button class="btn-sm drop" type="button" data-bs-toggle="dropdown" aria-expanded="false">⋮</button>
            <ul class="dropdown-menu">
              <li>
                <a class="dropdown-item block d-flex justify-content-center align-items-center" href="#">
              <i class="fa-solid ${
                user.status === "Active" ? "fa-ban" : "fa-unlock"
              } m-1"></i>
              <span class="block-text m-1">${
                user.status === "Active" ? "حظر المستخدم" : "إلغاء الحظر"
              }</span>
            </a>
              </li>
              <li>
                <a class="dropdown-item delete d-flex justify-content-center" href="#" data-bs-toggle="modal" data-bs-target="#deleteConfirmModal">
                  <i class="fa-solid fa-trash m-1"></i>حذف المستخدم
                </a>
              </li>
            </ul>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHTML;
  handleActive();
}

// ======== helpers ========
function escapeHtml(text = "") {
  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ======== handle active status (sets classes based on text) ========
function handleActive() {
  const tdStatus = document.querySelectorAll(".status");
  tdStatus.forEach((td) => {
    const span = td.querySelector(".status-indicator");
    if (td.textContent.includes("Active")) {
      span.classList.add("active");
    } else {
      span.classList.add("inactive");
    }
  });
}

// ======== filters (runs once) ========
function setupFilters() {
  if (!selectFilter) return;
  selectFilter.addEventListener("change", function () {
    const val = selectFilter.value;
    if (val === "الكل") {
      filteredUsers = users.slice();
    } else if (val === "النشطاء") {
      filteredUsers = users.filter(
        (u) => (u.status || "").toLowerCase() === "active"
      );
    } else if (val === "المحظورون") {
      filteredUsers = users.filter(
        (u) => (u.status || "").toLowerCase() === "inactive"
      );
    } else {
      filteredUsers = users.slice();
    }
    currentPage = 1;
    render();
  });
}

// ======== search (runs once) ========
function setupSearch() {
  if (!searchInput) return;
  // debounce to avoid many renders while typing (200ms)
  let timer = null;
  searchInput.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = (searchInput.value || "").trim().toLowerCase();
      if (!q) {
        applySearchOnFiltered("");
      } else {
        applySearchOnFiltered(q);
      }
      currentPage = 1;
      render();
    }, 200);
  });
}

function applySearchOnFiltered(query) {
  const q = (query || "").toLowerCase();
  let source = users.slice();
  const val = selectFilter ? selectFilter.value : "الكل";
  if (val === "النشطاء") {
    source = source.filter((u) => (u.status || "").toLowerCase() === "active");
  } else if (val === "المحظورون") {
    source = source.filter(
      (u) => (u.status || "").toLowerCase() === "inactive"
    );
  }

  if (!q) {
    filteredUsers = source;
  } else {
    filteredUsers = source.filter((u) => {
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q)
      );
    });
  }
}

// ======== pagination ========
function setupPagination() {
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  paginationEl.innerHTML = "";

  // helper create page item
  const createPageItem = (content, disabled = false, clickHandler = null) => {
    const li = document.createElement("li");
    li.className = "page-item";
    if (disabled) li.classList.add("disabled");
    li.innerHTML = `<a class="page-link" href="#">${content}</a>`;
    if (clickHandler) {
      li.addEventListener("click", (e) => {
        e.preventDefault();
        if (!li.classList.contains("disabled")) clickHandler(e);
      });
    }
    return li;
  };

  // prev3
  const prev3 = createPageItem("&laquo;", currentPage <= 3, () => {
    const newPage = Math.max(1, currentPage - 3);
    currentPage = newPage;
    render();
  });
  paginationEl.appendChild(prev3);

  // prev
  const prev = createPageItem("&lsaquo;", currentPage === 1, () => {
    currentPage = Math.max(1, currentPage - 1);
    render();
  });
  paginationEl.appendChild(prev);

  // page numbers
  const pageItems = [];
  for (let i = 1; i <= pageCount; i++) {
    const li = createPageItem(i, false, () => {
      currentPage = i;
      render();
    });
    if (i === currentPage) li.classList.add("active");
    pageItems.push(li);
    paginationEl.appendChild(li);
  }

  // next
  const next = createPageItem("&rsaquo;", currentPage === pageCount, () => {
    currentPage = Math.min(pageCount, currentPage + 1);
    render();
  });
  paginationEl.appendChild(next);

  // next3
  const next3 = createPageItem("&raquo;", currentPage >= pageCount - 2, () => {
    currentPage = Math.min(pageCount, currentPage + 3);
    render();
  });
  paginationEl.appendChild(next3);

  // show 3 li numbers window
  showLiWindow();

  function showLiWindow() {
    const numericLis = Array.from(
      paginationEl.querySelectorAll(".page-item")
    ).filter((li) => /^\d+$/.test(li.textContent.trim()));
    const pageNumberLis = numericLis;
    const start = Math.floor((currentPage - 1) / 3) * 3;
    pageNumberLis.forEach((li, idx) => {
      li.style.display = idx >= start && idx < start + 3 ? "" : "none";
      li.classList.toggle(
        "active",
        Number(li.textContent.trim()) === currentPage
      );
    });
  }
}

// ======== delete user (uses modal confirm) ========
let userToDeleteRow = null;
document.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".dropdown-item.delete");
  if (deleteBtn) {
    userToDeleteRow = deleteBtn.closest("tr");
  }
});

if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", function () {
    if (!userToDeleteRow) return;
    const email = userToDeleteRow.dataset.email;
    users = users.filter((u) => u.email !== email);
    applySearchOnFiltered((searchInput && searchInput.value) || "");
    render();
    const modalEl = document.getElementById("deleteConfirmModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
    userToDeleteRow = null;
  });
}

// ======== block / unblock user ========
document.addEventListener("click", (e) => {
  const blockBtn = e.target.closest(".dropdown-item.block");
  if (!blockBtn) return;

  const row = blockBtn.closest("tr");
  const email = row.dataset.email;
  const user = users.find((u) => u.email === email);
  if (!user) return;

  user.status =
    (user.status || "").toLowerCase() === "active" ? "Inactive" : "Active";

  // update UI text for the clicked item
  const span = row.querySelector(".status-indicator");
  if (user.status.toLowerCase() === "active") {
    span.classList.remove("inactive");
    span.classList.add("active");
    blockBtn.querySelector(".block-text").textContent = "حظر المستخدم";
  } else {
    span.classList.remove("active");
    span.classList.add("inactive");
    blockBtn.querySelector(".block-text").textContent = "إلغاء الحظر";
  }

  applySearchOnFiltered((searchInput && searchInput.value) || "");
  render();
});

// ======== add new user ========
if (confirmAddBtn) {
  confirmAddBtn.addEventListener("click", function () {
    const name = document.getElementById("recipient-name").value || "غير معروف";
    const email =
      document.getElementById("recipient-mail").value ||
      `user${Date.now()}@example.com`;
    const role = document.getElementById("recipient-role").value || "Employee";
    const date = new Date();
    const formatDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const newUser = {
      name,
      email,
      role,
      status: "Active",
      createdAt: formatDate,
    };
    users.unshift(newUser);
    applySearchOnFiltered((searchInput && searchInput.value) || "");
    render();

    const modalEl = document.getElementById("exampleModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  });
}

// ======== exports (excel/pdf) - async-ready ========
async function exportUsersToExcel() {
  const dataRows = [
    ["الاسم", "البريد الإلكتروني", "الدور", "الحالة", "تاريخ الإنشاء"],
    ...filteredUsers.map((u) => [
      u.name,
      u.email,
      u.role,
      u.status,
      u.createdAt,
    ]),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(dataRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "المستخدمين");
  const dateStr = new Date().toLocaleDateString("ar-EG").replace(/\//g, "-");
  XLSX.writeFile(workbook, `المستخدمين_${dateStr}.xlsx`);
}

async function exportUsersToPDF() {
  const tableClone = document.createElement("table");
  tableClone.className = "pdf-table";
  tableClone.style.width = "100%";
  tableClone.style.borderCollapse = "collapse";
  tableClone.style.fontSize = "12px";
  tableClone.style.direction = "rtl";
  tableClone.style.background = "white";
  tableClone.style.color = "black";

  tableClone.innerHTML = `
    <thead>
      <tr style="background:black; color:white;">
        <th style="border:1px solid #ccc; padding:4px;">الاسم</th>
        <th style="border:1px solid #ccc; padding:4px;">البريد الإلكتروني</th>
        <th style="border:1px solid #ccc; padding:4px;">الدور</th>
        <th style="border:1px solid #ccc; padding:4px;">الحالة</th>
        <th style="border:1px solid #ccc; padding:4px;">تاريخ الإنشاء</th>
      </tr>
    </thead>
    <tbody>
      ${filteredUsers
        .map(
          (u) => `<tr style="background:white; color:black;">
            <td style="border:1px solid #ccc; padding:4px; color:black !important;">${escapeHtml(
              u.name
            )}</td>
            <td style="border:1px solid #ccc; padding:4px; color:black !important;">${escapeHtml(
              u.email
            )}</td>
            <td style="border:1px solid #ccc; padding:4px; color:black !important;">${escapeHtml(
              u.role
            )}</td>
            <td style="border:1px solid #ccc; padding:4px; color:black !important;">${escapeHtml(
              u.status
            )}</td>
            <td style="border:1px solid #ccc; padding:4px; color:black !important;">${escapeHtml(
              u.createdAt
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
    pdf.save(`المستخدمين_${date}.pdf`);
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
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ======== init ========
loadUsers();

// delete from database
if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", async function () {
    if (!userToDeleteRow) return;
    const email = userToDeleteRow.dataset.email;

    try {
      await fetch(`/api/users/${email}`, {
        method: "DELETE",
      });

      users = users.filter((u) => u.email !== email);
      applySearchOnFiltered((searchInput && searchInput.value) || "");
      render();
    } catch (err) {
      console.error("خطأ في حذف المستخدم:", err);
    }

    const modalEl = document.getElementById("deleteConfirmModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
    userToDeleteRow = null;
  });
}
// edit
document.addEventListener("click", async (e) => {
  const blockBtn = e.target.closest(".dropdown-item.block");
  if (!blockBtn) return;

  const row = blockBtn.closest("tr");
  const email = row.dataset.email;
  const user = users.find((u) => u.email === email);
  if (!user) return;

  const newStatus =
    user.status.toLowerCase() === "active" ? "Inactive" : "Active";

  try {
    await fetch(`/api/users/${email}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    user.status = newStatus;

    const span = row.querySelector(".status-indicator");
    if (newStatus.toLowerCase() === "active") {
      span.classList.remove("inactive");
      span.classList.add("active");
      blockBtn.querySelector(".block-text").textContent = "حظر المستخدم";
    } else {
      span.classList.remove("active");
      span.classList.add("inactive");
      blockBtn.querySelector(".block-text").textContent = "إلغاء الحظر";
    }

    applySearchOnFiltered((searchInput && searchInput.value) || "");
    render();
  } catch (err) {
    console.error("خطأ في تعديل الحالة:", err);
  }
});

// add user
if (confirmAddBtn) {
  confirmAddBtn.addEventListener("click", async function () {
    const name = document.getElementById("recipient-name").value || "غير معروف";
    const email =
      document.getElementById("recipient-mail").value ||
      `user${Date.now()}@example.com`;
    const role = document.getElementById("recipient-role").value || "Employee";
    const date = new Date();
    const formatDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const newUser = {
      name,
      email,
      role,
      status: "Active",
      createdAt: formatDate,
    };

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const savedUser = await res.json();
      users.unshift(savedUser);
      applySearchOnFiltered((searchInput && searchInput.value) || "");
      render();
    } catch (err) {
      console.error("خطأ في إضافة المستخدم:", err);
    }

    const modalEl = document.getElementById("exampleModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  });
}
