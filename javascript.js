const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxzgSdj6LJgV-wJkvI75KxGylNsjpiYu9xZGqoRgM3ssT2FdcX-nKPKyte36Cuw8YCOvg/exec"; 

const form = document.getElementById("registrationForm");
const successPopup = document.getElementById("successPopup");
const duplicatePopup = document.getElementById("duplicatePopup");
const duplicateMessage = document.getElementById("duplicateMessage");
const closeSuccessBtn = document.getElementById("closeSuccessBtn");
const closeDuplicateBtn = document.getElementById("closeDuplicateBtn");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Mengirim...";

  const formData = {
    nama: document.getElementById("nama").value,
    email: document.getElementById("email").value,
    telepon: document.getElementById("telepon").value,
    kategori: document.getElementById("kategori").value
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(formData)
  })
    .then((res) => res.json())
    .then((response) => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Daftar Sekarang";

      if (response.status === "success") {
        successPopup.style.display = "flex";
        form.reset();
      } else {
        duplicateMessage.textContent = response.message || "Data sudah terdaftar di sistem.";
        duplicatePopup.style.display = "flex";
      }
    })
    .catch((error) => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Daftar Sekarang";
      alert("Terjadi kesalahan koneksi: " + error.message);
    });
});

closeSuccessBtn.addEventListener("click", () => {
  successPopup.style.display = "none";
});

closeDuplicateBtn.addEventListener("click", () => {
  duplicatePopup.style.display = "none";
});
