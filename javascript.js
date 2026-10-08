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

// Helper untuk mengubah tanggal database menjadi format "30 Oktober 2026"
function formatTanggal(tglStr) {
    if (!tglStr) return '-';
    let cleanStr = tglStr.toString().split('T')[0];
    let parts = cleanStr.split('-');
    if (parts.length === 3) {
        let tahun = parts[0];
        let bulanIndex = parseInt(parts[1], 10) - 1;
        let hari = parts[2];
        const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        if (namaBulan[bulanIndex]) {
            return `${parseInt(hari, 10)} ${namaBulan[bulanIndex]} ${tahun}`;
        }
    }
    return tglStr;
}

// Helper untuk mengubah string tanggal menjadi objek Date agar bisa diurutkan dari yang paling awal
function parseTanggalCustom(tglStr) {
    if (!tglStr) return new Date(8640000000000); // Taruh di akhir jika kosong
    let cleanStr = tglStr.toString().split('T')[0];
    let parts = cleanStr.split('-');
    if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    // Jika formatnya sudah "30 Oktober 2026"
    let p2 = tglStr.split(' ');
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

    // Urutkan data peserta berdasarkan tanggal treatment paling terdahulu (ascending)
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

        let cleanTglKey = formattedTgl;
        if (cleanTglKey && cleanTglKey !== '-') {
            countMap[cleanTglKey] = (countMap[cleanTglKey] || 0) + 1;
        }

        htmlTabel += `<tr>
            <td style="text-align: center; font-weight: 500; color: #475569;">${index + 1}</td>
            <td style="font-weight: 600; color: #1e293b;">${row.nama || '-'}</td>
            <td>${formattedTgl}</td>
            <td style="color: #475569;">${row.jam || '-'}</td>
        </tr>`;
    });

    if (data.length === 0) {
        htmlTabel = `<tr><td colspan="4" style="text-align: center; padding: 25px; color: #64748b;">Belum ada peserta terdaftar.</td></tr>`;
    }
    
    if (tabelBody) {
        tabelBody.innerHTML = htmlTabel;
    }

    // Update opsi dropdown tanggal dan info kuota (diurutkan berdasarkan elemen option di HTML)
    if (selectTanggalForm) {
        const options = selectTanggalForm.querySelectorAll('option');
        let infoHtml = "<b>Status Sisa Kuota:</b><ul style='margin: 8px 0 15px 20px; padding: 0; color: #334155;'>";

        options.forEach(option => {
            let tglValue = option.value;
            if (tglValue && tglValue !== "") {
                let jumlahPendaftar = countMap[tglValue] || 0;
                let sisaKuota = MAX_KUOTA - jumlahPendaftar;
                
                if (jumlahPendaftar >= MAX_KUOTA) {
                    option.disabled = true;
                    option.text = tglValue + " (PENUH - 13/13)";
                    infoHtml += `<li style="margin-bottom: 6px;">${tglValue}: <span style="color: #dc2626; font-weight: bold;">Penuh (13/13)</span></li>`;
                } else {
                    option.disabled = false;
                    option.text = tglValue + ` (${jumlahPendaftar}/13 - Sisa ${sisaKuota})`;
                    infoHtml += `<li style="margin-bottom: 6px;">${tglValue}: Tersisa <b>${sisaKuota}</b> slot (${jumlahPendaftar}/13)</li>`;
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
        setTimeout(loadDataKuota, 1500); 
    })
    .catch(error => {
        loadingDiv.style.display = 'none';
        submitBtn.disabled = false;
        alert('Terjadi kesalahan: ' + error);
    });
});
