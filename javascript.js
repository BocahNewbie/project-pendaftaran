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

// Fungsi helper untuk merapikan format tanggal
function formatTanggal(tglStr) {
    if (!tglStr) return '-';
    // Jika formatnya ISO / ada huruf T, ambil bagian tanggalnya saja
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

window.handleKuotaData = function(data) {
    const selectTanggalForm = document.getElementById('tanggal');
    const tabelBody = document.getElementById('tabelPesertaBody');
    const infoKuotaContainer = document.getElementById('infoKuotaContainer');
    
    if (!Array.isArray(data)) return;

    const countMap = {};
    let htmlTabel = "";
    
    // Hitung jumlah pendaftar per tanggal & susun baris tabel peserta
    data.forEach((row, index) => {
        let tglRaw = row.tanggal ? row.tanggal.toString().trim() : "";
        let tglClean = tglRaw.split('T')[0];
        if (tglClean) {
            countMap[tglClean] = (countMap[tglClean] || 0) + 1;
        }

        let tanggalFormatted = formatTanggal(row.tanggal);

        htmlTabel += `<tr style="transition: background 0.2s;">
            <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7; text-align: center; color: #4a5568;">${index + 1}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7; font-weight: 500; color: #2d3748;">${row.nama || '-'}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7; color: #4a5568;">${tanggalFormatted}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7; color: #4a5568;">${row.jam || '-'}</td>
        </tr>`;
    });

    if (data.length === 0) {
        htmlTabel = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #718096;">Belum ada peserta terdaftar.</td></tr>`;
    }
    
    if (tabelBody) {
        // Bungkus tabel dengan gaya modern yang bersih
        tabelBody.innerHTML = htmlTabel;
    }

    // Terapkan styling wrapper tabel agar terlihat rapi dan elegan
    const tableElement = tabelBody ? tabelBody.closest('table') : null;
    if (tableElement) {
        tableElement.style.width = '100%';
        tableElement.style.borderCollapse = 'collapse';
        tableElement.style.fontSize = '13px';
        tableElement.style.backgroundColor = '#ffffff';
        tableElement.style.borderRadius = '8px';
        tableElement.style.overflow = 'hidden';
        tableElement.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        
        // Styling Header Tabel
        const thead = tableElement.querySelector('thead');
        if (thead) {
            thead.style.backgroundColor = '#f7fafc';
            thead.style.color = '#4a5568';
            thead.style.textTransform = 'uppercase';
            thead.style.fontSize = '11px';
            thead.style.letterSpacing = '0.5px';
            const ths = thead.querySelectorAll('th');
            ths.forEach(th => {
                th.style.padding = '12px';
                th.style.borderBottom = '2px solid #e2e8f0';
            });
        }
    }

    // Update opsi dropdown tanggal dan info kuota
    if (selectTanggalForm) {
        const options = selectTanggalForm.querySelectorAll('option');
        let infoHtml = "<b>Status Sisa Kuota:</b><ul style='margin: 5px 0 15px 20px; padding: 0;'>";

        options.forEach(option => {
            let tglValue = option.value;
            if (tglValue && tglValue !== "") {
                let jumlahPendaftar = countMap[tglValue] || 0;
                let sisaKuota = MAX_KUOTA - jumlahPendaftar;
                
                if (jumlahPendaftar >= MAX_KUOTA) {
                    option.disabled = true;
                    option.text = tglValue + " (PENUH - 13/13)";
                    infoHtml += `<li>${tglValue}: <span style="color: red; font-weight: bold;">Penuh (13/13)</span></li>`;
                } else {
                    option.disabled = false;
                    option.text = tglValue + ` (${jumlahPendaftar}/13 - Sisa ${sisaKuota})`;
                    infoHtml += `<li>${tglValue}: Tersisa <b>${sisaKuota}</b> slot (${jumlahPendaftar}/13)</li>`;
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
