const scriptURL = 'https://script.google.com/macros/s/AKfycbxqYKDrmuGUYiZ2P3YtkfYLx3uxSyMtqqTAFus83-NsVDZMGyzhEOlfsz5XVvk8BWOMoQ/exec';
const MAX_KUOTA = 13;

document.addEventListener("DOMContentLoaded", function() {
    loadDataKuota();
    
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('popupModal').style.display = 'none';
        });
    }

    const inputNama = document.getElementById('nama');
    const inputAlamat = document.getElementById('alamat');
    if (inputNama) inputNama.addEventListener('input', function() { this.value = this.value.toUpperCase(); });
    if (inputAlamat) inputAlamat.addEventListener('input', function() { this.value = this.value.toUpperCase(); });
});

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

// Helper untuk membaca langsung string tanggal dari spreadsheet tanpa geser hari
function formatTanggal(tglStr) {
    if (!tglStr) return '-';
    let str = tglStr.toString().trim();
    if (!str.includes('T') && !str.includes('-')) {
        return str;
    }
    let cleanStr = str.split('T')[0];
    let parts = cleanStr.split('-');
    if (parts.length === 3) {
        let tahun = parts[0];
        let bulanIndex = parseInt(parts[1], 10) - 1;
        let hari = parseInt(parts[2], 10);
        const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        if (namaBulan[bulanIndex]) {
            return `${hari} ${namaBulan[bulanIndex]} ${tahun}`;
        }
    }
    return tglStr;
}

function parseTanggalCustom(tglStr) {
    if (!tglStr) return new Date(8640000000000);
    let formatted = formatTanggal(tglStr);
    let p2 = formatted.split(' ');
    if (p2.length === 3) {
        let hari = parseInt(p2[0], 10);
        let bulanNama = p2[1];
        let tahun = parseInt(p2[2], 10);
        const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        let bulanIndex = namaBulan.indexOf(bulanNama);
        if (bulanIndex !== -1) {
            return new Date(tahun, bulanIndex, hari);
        }
    }
    return new Date(tglStr);
}

// Helper untuk mengubah string jam (misal: "08.30" atau "Jam 10.00") menjadi angka menit untuk sorting
function parseJamToMinutes(jamStr) {
    if (!jamStr) return 9999;
    let clean = jamStr.toString().toLowerCase().replace(/jam/g, '').trim();
    clean = clean.replace('.', ':').replace(',', ':');
    let parts = clean.split(':');
    if (parts.length === 2) {
        let h = parseInt(parts[0], 10) || 0;
        let m = parseInt(parts[1], 10) || 0;
        return (h * 60) + m;
    }
    let singleNum = parseInt(clean, 10);
    if (!isNaN(singleNum)) {
        return singleNum * 60;
    }
    return 9999;
}

window.handleKuotaData = function(data) {
    const selectTanggalForm = document.getElementById('tanggal');
    const targetTabelArea = document.getElementById('tabelPesertaBody');
    const infoKuotaContainer = document.getElementById('infoKuotaContainer');
    
    if (!Array.isArray(data)) return;

    const countMap = {};
    const groupedData = {};

    data.forEach((row) => {
        let rawTgl = row.tanggal ? row.tanggal.toString().trim() : "";
        let formattedTgl = formatTanggal(rawTgl);

        if (formattedTgl && formattedTgl !== '-') {
            countMap[formattedTgl] = (countMap[formattedTgl] || 0) + 1;
            
            if (!groupedData[formattedTgl]) {
                groupedData[formattedTgl] = [];
            }
            groupedData[formattedTgl].push(row);
        }
    });

    let availableDates = [];
    if (selectTanggalForm) {
        selectTanggalForm.querySelectorAll('option').forEach(opt => {
            if (opt.value) availableDates.push(opt.value);
        });
    }

    // Urutkan tanggal dari yang paling awal
    availableDates.sort((a, b) => parseTanggalCustom(a) - parseTanggalCustom(b));

    let htmlGroups = "";
    
    if (availableDates.length === 0 && Object.keys(groupedData).length === 0) {
        htmlGroups = `<p style="text-align: center; color: #99f6e4; padding: 15px;">Belum ada peserta terdaftar. 📭</p>`;
    } else {
        availableDates.forEach(tgl => {
            let pesertaList = groupedData[tgl] || [];
            
            // Urutkan peserta berdasarkan jam mulai dari yang paling rendah (pagi ke malam)
            pesertaList.sort((a, b) => {
                let timeA = parseJamToMinutes(a.jam);
                let timeB = parseJamToMinutes(b.jam);
                return timeA - timeB;
            });

            let jumlahPendaftar = countMap[tgl] || 0;
            let statusBadge = jumlahPendaftar >= MAX_KUOTA ? `<span style="color: #f87171;">(Penuh 13/13 🚫)</span>` : `<span style="color: #5eead4;">(${jumlahPendaftar}/${MAX_KUOTA}) ✅</span>`;
            
            htmlGroups += `
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #5eead4; margin: 15px 0 8px 0; font-size: 14px; border-bottom: 1px dashed rgba(153, 246, 228, 0.2); padding-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
                        <span>📅 ${tgl}</span> 
                        <span>${statusBadge}</span>
                    </h4>
                    <!-- Ditambahkan max-height dan overflow-y: auto agar tabel bisa di-scroll -->
                    <div class="table-responsive" style="max-height: 220px; overflow-y: auto; border-radius: 10px;">
                        <table>
                            <thead style="position: sticky; top: 0; z-index: 1;">
                                <tr>
                                    <th style="width: 40px; text-align: center;">No</th>
                                    <th>Nama</th>
                                    <th style="width: 90px;">Jam</th>
                                </tr>
                            </thead>
                            <tbody>`;
            
            if (pesertaList.length === 0) {
                htmlGroups += `<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 10px; font-style: italic;">Belum ada peserta di tanggal ini</td></tr>`;
            } else {
                pesertaList.forEach((row, idx) => {
                    let namaPeserta = row.nama ? row.nama.toString().toUpperCase() : '-';
                    htmlGroups += `
                        <tr>
                            <td style="text-align: center; font-weight: 600; color: #5eead4;">${idx + 1}</td>
                            <td style="font-weight: 700; color: #ffffff; letter-spacing: 0.3px;">${namaPeserta}</td>
                            <td style="color: #99f6e4;">${row.jam || '-'}</td>
                        </tr>`;
                });
            }

            htmlGroups += `
                            </tbody>
                        </table>
                    </div>
                </div>`;
        });
    }

    if (targetTabelArea) {
        let wrapperGroup = document.getElementById('groupedTableContainer');
        if (!wrapperGroup) {
            wrapperGroup = document.createElement('div');
            wrapperGroup.id = 'groupedTableContainer';
            let oldTable = targetTabelArea.closest('table');
            if (oldTable) oldTable.style.display = 'none';
            let resp = targetTabelArea.closest('.table-responsive');
            if (resp && resp.parentNode) {
                resp.parentNode.appendChild(wrapperGroup);
            }
        }
        wrapperGroup.innerHTML = htmlGroups;
    }

    if (infoKuotaContainer) {
        infoKuotaContainer.innerHTML = "";
    }

    if (selectTanggalForm) {
        const options = selectTanggalForm.querySelectorAll('option');
        options.forEach(option => {
            let tglValue = option.value;
            if (tglValue && tglValue !== "") {
                let jumlahPendaftar = countMap[tglValue] || 0;
                if (jumlahPendaftar >= MAX_KUOTA) {
                    option.disabled = true;
                    option.text = tglValue + " (PENUH - 13/13)";
                } else {
                    option.disabled = false;
                    option.text = tglValue + ` (${jumlahPendaftar}/${MAX_KUOTA})`;
                }
            }
        });
    }
};

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
        setTimeout(loadDataKuota, 1500); 
    })
    .catch(error => {
        loadingDiv.style.display = 'none';
        submitBtn.disabled = false;
        alert('Terjadi kesalahan: ' + error);
    });
});
