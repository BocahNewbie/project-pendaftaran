const scriptURL = 'https://script.google.com/macros/s/AKfycbymNzVYA71wpGjD4yKVRlpmwoO772hCpMoeSMaDFwkVU7ZrbHy0MT7wwc4I63OpVa0D_Q/exec';
const MAX_KUOTA = 14;

// Daftar semua tanggal yang tersedia di form
const DAFTAR_TANGGAL = [
    "30 Oktober 2026",
    "31 Oktober 2026",
    "1 November 2026",
    "2 November 2026",
    "3 November 2026"
];

document.addEventListener("DOMContentLoaded", function() {
    loadDataPeserta();

    // Tombol tutup modal popup
    document.getElementById('closeModalBtn').addEventListener('click', function() {
        document.getElementById('popupModal').style.display = 'none';
    });
});

// Mengambil data dari Google Sheets menggunakan metode JSONP agar tembus CORS
function loadDataPeserta() {
    const oldScript = document.getElementById('jsonpScript');
    if (oldScript) {
        oldScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'jsonpScript';
    script.src = scriptURL + "?callback=handleSheetData&t=" + new Date().getTime();
    document.body.appendChild(script);
}

// Fungsi global penerima data dari Google Apps Script
window.handleSheetData = function(data) {
    if (Array.isArray(data)) {
        window.allDataPeserta = data;
        updateOpsiTanggalDanUI(data);
    } else {
        window.allDataPeserta = [];
        updateOpsiTanggalDanUI([]);
    }
};

// Memperbarui status kuota & opsi tanggal yang penuh pada form utama
function updateOpsiTanggalDanUI(data) {
    const selectTanggalForm = document.getElementById('tanggal');
    const options = selectTanggalForm.querySelectorAll('option');

    const countMap = {};
    if (Array.isArray(data)) {
        data.forEach(row => {
            let tgl = row.tanggal ? row.tanggal.toString().trim() : "";
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

    renderSemuaPesertaPerTanggal(data);
}

// Merender daftar peserta per tanggal secara berderet ke bawah dengan format tabel No | Nama | Jam
function renderSemuaPesertaPerTanggal(data) {
    const container = document.getElementById('containerSemuaTanggal');
    container.innerHTML = "";

    DAFTAR_TANGGAL.forEach(tgl => {
        // Filter peserta berdasarkan tanggal
        let pesertaList = [];
        if (Array.isArray(data)) {
            pesertaList = data.filter(row => row.tanggal && row.tanggal.toString().trim() === tgl);
        }

        let sisaKuota = MAX_KUOTA - pesertaList.length;

        // Buat pembungkus per tanggal
        let sectionDiv = document.createElement('div');
        sectionDiv.className = 'tanggal-section';

        let headerHtml = `
            <div class="tanggal-header">
                <strong>${tgl}</strong>
                <span class="badge-kuota">Terisi: ${pesertaList.length}/${MAX_KUOTA}</span>
            </div>
        `;

        let tableHtml = `<table class="tabel-peserta">
            <thead>
                <tr>
                    <th style="width: 15%;">No</th>
                    <th style="width: 60%;">Nama</th>
                    <th style="width: 25%;">Jam</th>
                </tr>
            </thead>
            <tbody>`;

        if (pesertaList.length === 0) {
            tableHtml += `<tr><td colspan="3" style="text-align: center; color: #888; padding: 8px;">Belum ada peserta</td></tr>`;
        } else {
            pesertaList.forEach((p, index) => {
                tableHtml += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${p.nama}</td>
                        <td>${p.jam || '-'}</td>
                    </tr>
                `;
            });
        }

        tableHtml += `</tbody></table>`;

        sectionDiv.innerHTML = headerHtml + tableHtml;
        container.appendChild(sectionDiv);
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
        
        // Tampilkan Modal Popup Berhasil
        document.getElementById('popupModal').style.display = 'flex';
        
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
