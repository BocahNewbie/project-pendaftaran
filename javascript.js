const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_AD7jZfP7jeDgiG98N8G-gwb2JImQFPhjKakg404cyqtXdZN38tLMq0lzBm9i9dnoFA/exec"; // Ganti dengan URL /exec milikmu

const form = document.getElementById("registrationForm");
const successPopup = document.getElementById("successPopup");
const duplicatePopup = document.getElementById("duplicatePopup");
const duplicateMessage = document.getElementById("duplicateMessage");
const closeSuccessBtn = document.getElementById("closeSuccessBtn");
const closeDuplicateBtn = document.getElementById("closeDuplicateBtn");

// Fungsi untuk mengambil dan menampilkan data peserta
function loadPeserta() {
  fetch(SCRIPT_URL)
    .then((res) => res.json())
    .then((response) => {
      if (response.status === "success") {
        renderList("merangkak", response.data["Merangkak"]);
        renderList("berjalan", response.data["Berjalan"]);
        renderList("pindah-bola", response.data["Pindah Bola"]);
      }
    })
    .catch((err) => console.error("Gagal memuat peserta:", err));
}

function renderList(idPrefix, listData) {
  const listEl = document.getElementById(`list-${idPrefix}`);
  const countEl = document.getElementById(`count-${idPrefix}`);

  listEl.innerHTML = "";
  countEl.textContent = listData ? listData.length : 0;

  if (!listData || listData.length === 0) {
    listEl.innerHTML = "<li class='empty'>Belum ada peserta</li>";
    return;
  }

  listData.forEach((nama) => {
    const li = document.createElement("li");
    li.textContent = nama;
    listEl.appendChild(li);
  });
}

// Load data peserta saat pertama kali halaman terbuka
document.addEventListener("DOMContentLoaded", loadPeserta);

// Handle Submit Form
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Mengirim...";

  const formData = {
    nama: document.getElementById("nama_anak").value,     // Menangkap ID anak
    nama_ortu: document.getElementById("nama").value,     // Menangkap ID orang tua
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
        loadPeserta(); // Reload daftar peserta setelah sukses mendaftar
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
