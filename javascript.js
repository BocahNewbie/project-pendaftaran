const scriptURL = 'https://script.google.com/macros/s/AKfycbxrOWyqu7skZA_DgxNRb960Nihxv3BA1zBkwkJZqdx2F8YdMOsCm1RvhFhJVRp_7WJKaQ/exec';
const MAX_KUOTA = 13;

document.addEventListener("DOMContentLoaded", function() {
    loadDataKuota();
    
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('popupModal').style.display = 'none';
        });
    }

    // Paksa input teks menjadi huruf kapital secara otomatis saat diketik
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
    // Jika dari spreadsheet bentuknya sudah teks "30 Oktober 2026", langsung kembalikan
    if (!str.includes('T') && !str.includes('-')) {
        return str;
    }
    // Jika bentuknya format ISO (YYYY-MM-DD), ambil bagian tahun, bulan, hari secara manual
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

// Helper untuk sorting tanggal secara akurat
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

window.handleKuotaData = function(data) {
    const selectTanggalForm = document.getElementById('tanggal');
    const tabelBody = document.getElementById('tabelPesertaBody');
    const infoKuotaContainer = document.getElementById('infoKuotaContainer');
    
    if (!Array.isArray(data)) return;

    // Urutkan data berdasarkan tanggal paling terdahulu
    data.sort((a, b) => {
        let dateA = parseTanggalCustom(a.tanggal);
        let dateB = parseTanggalCustom(b.tanggal);
        return dateA - dateB;
    });

    const countMap = {};
    let htmlTabel = "";
    
    data.forEach((row, index) => {
        let rawTgl = row.tanggal ? row.tanggal.toString().trim() : "";
        let formattedTgl = formatTanggal(rawTgl);

        if (formattedTgl && formattedTgl !== '-') {
            countMap[formattedTgl] = (countMap[formattedTgl] || 0) + 1;
        }

        let namaPeserta = row.nama ? row.nama.toString().toUpperCase() : '-';

        htmlTabel += `<tr>
            <td style="text-align: center; font-weight: 600; color: #5eead4;">${index + 1}</td>
            <td style="font-weight: 700; color: #ffffff; letter-spacing: 0.3px;">${namaPeserta}</td>
            <td style="color: #ccfbef;">${formattedTgl}</td>
            <td style="color: #99f6e4;">${row.jam || '-'}</td>
        </tr>`;
    });

    if (data.length === 0) {
        htmlTabel = `<tr><td colspan="4" style="text-align: center; padding: 25px; color: #99f6e4;">Belum ada peserta terdaftar. 📭</td></tr>`;
    }
    
    if (tabelBody) {
        tabelBody.innerHTML = htmlTabel;
    }

    if (selectTanggalForm) {
        const options = selectTanggalForm.querySelectorAll('option');
        let infoHtml = "<b>📊 Status Sisa Kuota:</b><ul style='margin: 8px 0 15px 20px; padding: 0;'>";

        options.forEach(option => {
            let tglValue = option.value;
            if (tglValue && tglValue !== "") {
                let jumlahPendaftar = countMap[tglValue] || 0;
                let sisaKuota = MAX_KUOTA - jumlahPendaftar;
                
                if (jumlahPendaftar >= MAX_KUOTA) {
                    option.disabled = true;
                    option.text = tglValue + " (PENUH - 13/13)";
                    infoHtml += `<li style="margin-bottom: 6px;">✨ ${tglValue}: <span style="color: #f87171; font-weight: bold;">Penuh (${jumlahPendaftar}/${MAX_KUOTA}) 🚫</span></li>`;
                } else {
                    option.disabled = false;
                    option.text = tglValue + ` (${jumlahPendaftar}/${MAX_KUOTA})`;
                    // Tulisan "Tersisa" dihilangkan, menyisakan nama tanggal dan format slot (contoh: 2/13)
                    infoHtml += `<li style="margin-bottom: 6px;">📅 ${tglValue}: <b>(${jumlahPendaftar}/${MAX_KUOTA})</b> ✅</li>`;
                }
            }
        });
        infoHtml += "</ul>";
        
        if (infoKuotaContainer) {
            infoKuotaContainer.innerHTML = infoHtml;
        }
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
