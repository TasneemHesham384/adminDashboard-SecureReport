document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.querySelector('input[type="text"]');
  const emailInput = document.querySelector('input[type="email"]');
  const phoneInput = document.querySelector('input[type="tel"]');
  const addressInput = document.querySelector('textarea');
  const currentPasswordInput = document.querySelector('input[type="password"]:nth-of-type(1)');
  const newPasswordInput = document.querySelector('input[type="password"]:nth-of-type(2)');
  const imageInput = document.querySelector('input[type="file"]');
  const saveBtn = document.querySelector('button.btn-primary');

  fetch("/api/profile")
    .then((res) => res.json())
    .then((data) => {
      nameInput.value = data.name || "";
      emailInput.value = data.email || "";
      phoneInput.value = data.phone || "";
      addressInput.value = data.address || "";
      document.querySelector("h6").textContent = data.name;
      document.querySelector(".text-muted.mb-0").textContent = data.email;
      document.querySelector(".text-muted:last-of-type").textContent = data.role;
      document.querySelector("img").src = data.avatar || "imgs/default-avatar2.png";
    })
    .catch((err) => console.error("خطأ في تحميل البيانات:", err));

  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const payload = {
      name: nameInput.value,
      email: emailInput.value,
      phone: phoneInput.value,
      address: addressInput.value,
      password: newPasswordInput.value,
      currentPassword: currentPasswordInput.value
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      alert("تم حفظ التغييرات بنجاح");
    } catch (err) {
      console.error("خطأ في حفظ التغييرات:", err);
      alert("حدث خطأ أثناء الحفظ");
    }
  });

  imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      document.querySelector("img").src = result.avatar;
    } catch (err) {
      console.error("خطأ في رفع الصورة:", err);
      alert("تعذر رفع الصورة");
    }
  });
});
