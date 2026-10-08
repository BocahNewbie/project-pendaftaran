const scriptURL = 'https://script.google.com/macros/s/AKfycbyPte84c-av-IYfshpnDGG4Z1Jq_mrWAem9vngwCoc3H6QOtctZOiu432TkABjm1RhtaQ/exec';
const MAX_KUOTA = 14;

document.addEventListener("DOMContentLoaded", function() {
    loadDataPeserta();
    document.getElementById('filterTanggal').addEventListener('change', renderPesertaDanKuota);
});

// Mengambil data dari Google Sheets via GET
function loadDataPeserta() {
    fetch(scriptURL)
    .then(response => response.json())
    .then(data => {
        window.allDataPeserta = data; 
        updateOpsiTanggalDanUI(data);
    })
    .catch(error => {
        console.log("Gagal memuat data peserta:", error);
        document.getElementById('listPeserta').innerHTML = "<li>Gagal memuat data.</li>";
    });
}

// Memperbarui status kuota & opsi tanggal yang penuh
function updateOpsiTanggalDanUI(data) {
    const selectTanggalForm = document.getElementById('tanggal');
    const options = selectTanggalForm.querySelectorAll('option');

    const countMap = {};
    if (Array.isArray(data)) {
        data.forEach(row => {
            let tgl = row.tanggal;
            if (tgl) {
                countMap[tgl] = (countMap[tgl] || 0) + 1;
            }
        });
    }

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

// Menampilkan list peserta (Hanya Nama dan Jam saja)
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
        // Menampilkan Nama dan Jam Treatment
        li.innerHTML = `<span>${index + 1}. ${p.nama}</span> <b>${p.jam || '-'}</b>`;
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
