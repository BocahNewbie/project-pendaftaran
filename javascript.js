const scriptURL = 'https://script.google.com/macros/s/AKfycbzWrBVYTFi22twab_zOpYoQcARVMbibBs6Jo_OIj9H2TateFVWxmGmhnVuV6UOGdvuggg/exec';
const MAX_KUOTA = 13;

document.addEventListener("DOMContentLoaded", function() {
    loadDataKuota();
    
    const filterTgl = document.getElementById('filterTanggal');
    if (filterTgl) {
        filterTgl.addEventListener('change', renderPesertaDiSidebar);
    }

    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('popupModal').style.display = 'none';
        });
    }
});

// Mengambil data kuota & peserta dari Google Sheets via JSONP
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

// Fungsi global penerima data dari Google Apps Script
window.handleKuotaData = function(data) {
    window.allDataPeserta = data; // Simpan data global untuk sidebar
    
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
                option.text = tglValue + ` (${jumlahPendaftar}/13)`;
            }
        }
    });

    renderPesertaDiSidebar();
};

// Menampilkan list peserta (Nama & Jam) di sidebar berdasarkan tanggal yang dipilih
function renderPesertaDiSidebar() {
    const filterElement = document.getElementById('filterTanggal');
    const listContainer = document.getElementById('listPeserta');
    const kuotaBadge = document.getElementById('kuotaBadge');
    
    if (!filterElement || !listContainer) return;

    const filterTgl = filterElement.value;
    listContainer.innerHTML = "";
    
    let pesertaList = [];
    if (window.allDataPeserta && Array.isArray(window.allDataPeserta)) {
        pesertaList = window.allDataPeserta.filter(row => row.tanggal && row.tanggal.toString().trim() === filterTgl);
    }

    let sisaKuota = MAX_KUOTA - pesertaList.length;
    if (kuotaBadge) {
        kuotaBadge.textContent = `Terisi: ${pesertaList.length}/${MAX_KUOTA} | Sisa Kuota: ${sisaKuota > 0 ? sisaKuota : 0}`;
    }

    if (pesertaList.length === 0) {
        listContainer.innerHTML = "<li>Belum ada peserta di tanggal ini.</li>";
        return;
    }

    pesertaList.forEach((p, index) => {
        let li = document.createElement('li');
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

    submitBtn.disabled = true;
    loadingDiv.style.display = 'block';

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
        
        const modal = document.getElementById('popupModal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
        document.getElementById('pendaftaranForm').reset();
        
        // Refresh data dan kuota setelah submit
        setTimeout(loadDataKuota, 1500);
    })
    .catch(error => {
        loadingDiv.style.display = 'none';
        submitBtn.disabled = false;
        alert('Terjadi kesalahan: ' + error);
    });
});
