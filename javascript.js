const scriptURL = 'https://script.google.com/macros/s/AKfycbwEZD2R6eSQ1sR-Z-JZBdpFwFVLICb8IAna9mIJFp6IggrTS_OVe5xdJW-08_jQgUZa4w/exec';
const MAX_KUOTA = 13; // Kuota maksimal diperbarui menjadi 13 orang per hari

document.addEventListener("DOMContentLoaded", function() {
    loadDataKuota();

    // Tombol tutup modal popup agar dapat diklik dengan normal
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('popupModal').style.display = 'none';
        });
    }
});

// Mengambil data kuota dari Google Sheets via JSONP
function loadDataKuota() {
    const oldScript = document.getElementById('jsonpScript');
    if (oldScript) {
        oldScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'jsonpScript';
    script.src = scriptURL + "?callback=handleKuotaData&t=" + new Date().getTime();
    document.body.appendChild(script);
}

// Fungsi global penerima data kuota dari Google Apps Script
window.handleKuotaData = function(data) {
    const selectTanggalForm = document.getElementById('tanggal');
    if (!selectTanggalForm) return;
    
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
                option.text = tglValue + " (PENUH - 13/13)";
            } else {
                option.disabled = false;
                // Menampilkan informasi sisa kuota di pilihan dropdown
                option.text = tglValue + ` (${jumlahPendaftar}/13)`;
            }
        }
    });
};

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
        const modal = document.getElementById('popupModal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
        document.getElementById('pendaftaranForm').reset();
        
        // Refresh pengecekan kuota setelah submit
        setTimeout(loadDataKuota, 1500);
    })
    .catch(error => {
        loadingDiv.style.display = 'none';
        submitBtn.disabled = false;
        
        responseMessage.style.color = 'red';
        responseMessage.textContent = 'Terjadi kesalahan: ' + error;
    });
});
