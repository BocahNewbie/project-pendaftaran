// Ganti URL di bawah dengan URL Deployment Web App Google Apps Script Anda yang aktif
const scriptURL = 'https://script.google.com/macros/s/AKfycbxphZOJUP-Sc5UwRkTELxjrjoxQF_qc7IuuwRnygEVcQvJnL1pl0xmW-mzI5ojYRqcDJg/exec'; 
const MAX_KUOTA = 14;

document.addEventListener("DOMContentLoaded", function() {
    loadDataPeserta();
    
    document.getElementById('filterTanggal').addEventListener('change', renderPesertaDanKuota);
});

// Mengambil data dari Google Sheets (menggunakan metode GET dari Apps Script / Web App URL yang sama)
function loadDataPeserta() {
    fetch(scriptURL)
    .then(response => response.json())
    .then(data => {
        window.allDataPeserta = data; // Simpan data global
        updateOpsiTanggalDanUI(data);
    })
    .catch(error => {
        console.log("Gagal memuat data peserta:", error);
    });
}

// Memperbarui status kuota & opsi tanggal yang penuh
function updateOpsiTanggalDanUI(data) {
    const selectTanggalForm = document.getElementById('tanggal');
    const options = selectTanggalForm.querySelectorAll('option');

    // Hitung jumlah pendaftar per tanggal
    const countMap = {};
    if (Array.isArray(data)) {
        data.forEach(row => {
            let tgl = row.tanggal;
            if (tgl) {
                countMap[tgl] = (countMap[tgl] || 0) + 1;
            }
        });
    }

    // Cek kuota untuk setiap tanggal di form
    options.forEach(option => {
        let tglValue = option.value;
        if (tglValue && tglValue !== "") {
            let jumlahPendaftar = countMap[tglValue] || 0;
            if (jumlahPendaftar >= MAX_KUOTA) {
                option.disabled = true;
                option.text = tglValue + " (PENUH - 14/14)";
            } else {
                option.disabled = false;
                option.text = tglValue + ` (${jumlahPendaftar}/14)`;
            }
        }
    });

    renderPesertaDanKuota();
}

// Menampilkan list peserta sesuai filter tanggal yang dipilih di sidebar
function renderPesertaDanKuota() {
    const filterTgl = document.getElementById('filterTanggal').value;
    const listContainer = document.getElementById('listPeserta');
    const kuotaBadge = document.getElementById('kuotaBadge');
    
    listContainer.innerHTML = "";
    
    let pesertaList = [];
    if (window.allDataPeserta && Array.isArray(window.allDataPeserta)) {
        pesertaList = window.allDataPeserta.filter(row => row.tanggal === filterTgl);
    }

    let sisaKuota = MAX_KUOTA - pesertaList.length;
    kuotaBadge.textContent = `Terisi: ${pesertaList.length}/${MAX_KUOTA} | Sisa Kuota: ${sisaKuota > 0 ? sisaKuota : 0}`;

    if (pesertaList.length === 0) {
        listContainer.innerHTML = "<li>Belum ada peserta di tanggal ini.</li>";
        return;
    }

    pesertaList.forEach((p, index) => {
        let li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}. ${p.nama}</span> <b>${p.keterangan || 'Belum'}</b>`;
        listContainer.appendChild(li);
    });
}

// Event Submit Form Pendaftaran
document.getElementById('pendaftaranForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        nama: document.getElementById('nama').value,
        alamat: document.getElementById('alamat').value,
        telepon: document.getElementById('telepon').value,
        tanggal: document.getElementById('tanggal').value,
        jam: document.getElementById('jam').value,
        keterangan: document.getElementById('keterangan').value
    };

    const submitBtn = document.getElementById('submitBtn');
    const loadingDiv = document.getElementById('loading');
    const responseMessage = document.getElementById('responseMessage');

    submitBtn.disabled = true;
    loadingDiv.style.display = 'block';
    responseMessage.textContent = '';

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(() => {
        loadingDiv.style.display = 'none';
        submitBtn.disabled = false;
        
        responseMessage.style.color = '#00695c';
        responseMessage.textContent = 'Pendaftaran berhasil dikirim!';
        
        document.getElementById('pendaftaranForm').reset();
        
        // Refresh data setelah submit berhasil
        setTimeout(loadDataPeserta, 1500);
    })
    .catch(error => {
        loadingDiv.style.display = 'none';
        submitBtn.disabled = false;
        
        responseMessage.style.color = 'red';
        responseMessage.textContent = 'Terjadi kesalahan: ' + error;
    });
});
