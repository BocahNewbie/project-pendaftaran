const scriptURL = 'https://script.google.com/macros/s/AKfycbxqYKDrmuGUYiZ2P3YtkfYLx3uxSyMtqqTAFus83-NsVDZMGyzhEOlfsz5XVvk8BWOMoQ/exec';

let globalDataPeserta = [];
const MAX_KUOTA = 13; // Batas kuota per tanggal

// 1. Ambil data saat halaman dimuat
function loadDataKuota() {
    fetch(scriptURL)
        .then(response => response.json())
        .then(data => {
            globalDataPeserta = data;
            
            let countMap = {};
            data.forEach(row => {
                let tgl = row.tanggal;
                if (tgl) {
                    countMap[tgl] = (countMap[tgl] || 0) + 1;
                }
            });

            // Update tampilan kuota di pilihan tanggal
            const selectTanggalForm = document.getElementById('tanggal');
            if (selectTanggalForm) {
                const options = selectTanggalForm.querySelectorAll('option');
                options.forEach(option => {
                    let tglValue = option.value;
                    if (tglValue && tglValue !== "") {
                        let jumlahPendaftar = countMap[tglValue] || 0;
                        if (jumlahPendaftar >= MAX_KUOTA) {
                            option.disabled = true;
                            option.text = tglValue + " (PENUH - " + jumlahPendaftar + "/" + MAX_KUOTA + ")";
                        } else {
                            option.disabled = false;
                            option.text = tglValue + " (" + jumlahPendaftar + "/" + MAX_KUOTA + ")";
                        }
                    }
                });
            }

            // Render tabel rekap peserta jika elemennya ada
            renderDaftarPeserta(data);
            
            // Perbarui jam terpakai sesuai tanggal yang dipilih saat ini
            updateJamTerpakai();
        })
        .catch(error => console.error('Gagal memuat data:', error));
}

// 2. Fungsi untuk mendisable jam yang sudah dipilih pada tanggal tersebut
function updateJamTerpakai() {
    const selectedTanggal = document.getElementById('tanggal').value;
    const selectJam = document.getElementById('jam');
    if (!selectJam) return;

    const options = selectJam.querySelectorAll('option');

    // Reset semua opsi jam menjadi aktif kembali
    options.forEach(opt => {
        if (opt.value !== "" && !opt.textContent.includes("Istirahat")) {
            opt.disabled = false;
            opt.text = opt.value;
        }
    });

    if (!selectedTanggal) return;

    // Filter peserta berdasarkan tanggal
    const pesertaDiTanggalIni = globalDataPeserta.filter(item => item.tanggal === selectedTanggal);
    const jamTerpakai = pesertaDiTanggalIni.map(item => item.jam);

    // Matikan opsi jam yang sudah terisi
    options.forEach(opt => {
        if (jamTerpakai.includes(opt.value)) {
            opt.disabled = true;
            opt.text = opt.value + " (Sudah Terisi ❌)";
        }
    });
}

// Event listener saat tanggal diubah
const inputTanggal = document.getElementById('tanggal');
if (inputTanggal) {
    inputTanggal.addEventListener('change', updateJamTerpakai);
}

// 3. Render tabel rekap peserta (jika ada bagian tabelnya di HTML)
function renderDaftarPeserta(data) {
    // Fungsi ini disesuaikan jika halaman web Anda menampilkan tabel daftar peserta
}

// 4. Handle Submit Form Pendaftaran
document.getElementById('pendaftaranForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        nama: document.getElementById('nama').value.toUpperCase(),
        alamat: document.getElementById('alamat').value.toUpperCase(),
        telepon: document.getElementById('telepon').value,
        tanggal: document.getElementById('tanggal').value,
        jam: document.getElementById('jam').value,
        keterangan: document.getElementById('keterangan').value
    };

    const submitBtn = document.getElementById('submitBtn');
    const loadingContainer = document.getElementById('loadingContainer');

    // Nonaktifkan tombol dan tampilkan progress bar
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    if (loadingContainer) {
        loadingContainer.style.display = 'block';
    }

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(() => {
        // Sembunyikan loading dan aktifkan kembali tombol
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';

        const modal = document.getElementById('popupModal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
        document.getElementById('pendaftaranForm').reset();
        setTimeout(loadDataKuota, 1500);
    })
    .catch(error => {
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        alert('Terjadi kesalahan: ' + error);
    });
});

// Jalankan saat halaman pertama kali dimuat
window.onload = function() {
    loadDataKuota();
};
