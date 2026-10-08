const scriptURL = 'https://script.google.com/macros/s/AKfycbxqYKDrmuGUYiZ2P3YtkfYLx3uxSyMtqqTAFus83-NsVDZMGyzhEOlfsz5XVvk8BWOMoQ/exec';

let globalDataPeserta = [];

// Fungsi untuk menentukan kuota maksimal berdasarkan tanggal
function getKuotaMaksimal(tanggalStr) {
    if (tanggalStr && tanggalStr.includes("30 Oktober 2026")) {
        return 6; // Kuota khusus tanggal 30 Oktober 2026 adalah 6 orang
    }
    return 13; // Kuota default tanggal lainnya adalah 13 orang
}

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

            // Update tampilan kuota dan status tutup (disabled) di pilihan tanggal
            const selectTanggalForm = document.getElementById('tanggal');
            if (selectTanggalForm) {
                const options = selectTanggalForm.querySelectorAll('option');
                options.forEach(option => {
                    let tglValue = option.value;
                    if (tglValue && tglValue !== "") {
                        let maxKuota = getKuotaMaksimal(tglValue);
                        let jumlahPendaftar = countMap[tglValue] || 0;
                        
                        if (jumlahPendaftar >= maxKuota) {
                            option.disabled = true;
                            option.text = tglValue + " (PENUH - " + jumlahPendaftar + "/" + maxKuota + " ❌)";
                        } else {
                            option.disabled = false;
                            option.text = tglValue + " (" + jumlahPendaftar + "/" + maxKuota + ")";
                        }
                    }
                });
            }

            // Render ulang tabel rekap peserta per tanggal
            renderDaftarPeserta(data);
            
            // Perbarui jam terpakai sesuai tanggal yang dipilih
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

// 3. Render tabel rekap peserta per tanggal
function renderDaftarPeserta(data) {
    const targetTabelArea = document.getElementById('targetTabelArea');
    if (!targetTabelArea) {
        // Fallback jika menggunakan elemen tabel biasa
        const tbody = document.getElementById('tabelPesertaBody');
        if (!tbody) return;

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px;">Belum ada data peserta.</td></tr>`;
            return;
        }

        let rowsHtml = '';
        data.forEach((row, index) => {
            rowsHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${row.nama || '-'}</td>
                    <td>${row.tanggal || '-'}</td>
                    <td>${row.jam || '-'}</td>
                </tr>
            `;
        });
        tbody.innerHTML = rowsHtml;
        return;
    }

    // Ambil semua opsi tanggal yang ada di form
    const selectTanggalForm = document.getElementById('tanggal');
    if (!selectTanggalForm) return;

    const options = selectTanggalForm.querySelectorAll('option');
    let htmlContent = '';

    options.forEach(option => {
        let tglValue = option.value;
        if (!tglValue || tglValue === "") return;

        let maxKuota = getKuotaMaksimal(tglValue);
        let pesertaTanggal = data.filter(item => item.tanggal === tglValue);
        let jumlah = pesertaTanggal.length;
        let isPenuh = jumlah >= maxKuota;

        htmlContent += `
            <div style="margin-bottom: 20px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
                <h4 style="color: ${isPenuh ? '#ff6b6b' : '#d4af37'}; margin-bottom: 10px;">
                    📅 ${tglValue} (${jumlah}/${maxKuota}) ${isPenuh ? '❌ PENUH' : '✅'}
                </h4>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <thead>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left;">
                                <th style="padding: 8px;">NO</th>
                                <th style="padding: 8px;">NAMA</th>
                                <th style="padding: 8px;">JAM</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        if (pesertaTanggal.length > 0) {
            pesertaTanggal.forEach((p, index) => {
                htmlContent += `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 8px;">${index + 1}</td>
                        <td style="padding: 8px;">${p.nama}</td>
                        <td style="padding: 8px;">${p.jam}</td>
                    </tr>
                `;
            });
        } else {
            htmlContent += `
                <tr>
                    <td colspan="3" style="padding: 10px; text-align: center; color: #888;">Belum ada peserta di tanggal ini</td>
                </tr>
            `;
        }

        htmlContent += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });

    targetTabelArea.innerHTML = htmlContent;
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
    const loadingDiv = document.getElementById('loading') || document.getElementById('loadingContainer');

    // Nonaktifkan tombol dan tampilkan loading
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    if (loadingDiv) {
        loadingDiv.style.display = 'block';
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
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
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
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        alert('Terjadi kesalahan: ' + error);
    });
});

// Tutup modal popup jika tombol diklik
const closeModalBtn = document.getElementById('closeModalBtn');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function() {
        document.getElementById('popupModal').style.display = 'none';
    });
}

// Jalankan saat halaman pertama kali dimuat
window.onload = function() {
    loadDataKuota();
};
