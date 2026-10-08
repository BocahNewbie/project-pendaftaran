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

window.handleKuotaData = function(data) {
    const selectTanggalForm = document.getElementById('tanggal');
    const tabelBody = document.getElementById('tabelPesertaBody');
    const infoKuotaContainer = document.getElementById('infoKuotaContainer');
    
    if (!Array.isArray(data)) return;

    const countMap = {};
    let htmlTabel = "";
    
    // Hitung jumlah pendaftar per tanggal dengan normalisasi string
    data.forEach((row, index) => {
        let rawTgl = row.tanggal ? row.tanggal.toString().trim() : "";
        let formattedTgl = formatTanggal(rawTgl); // Menyamakan format agar cocok dengan dropdown

        if (formattedTgl && formattedTgl !== '-') {
            countMap[formattedTgl] = (countMap[formattedTgl] || 0) + 1;
        }

        // Render baris tabel peserta dengan gaya modern langsung di JS (agar aman dari CSS luar)
        htmlTabel += `<tr style="transition: background 0.2s;">
            <td style="padding: 12px 14px; border-bottom: 1px solid #edf2f7; text-align: center; color: #4a5568; font-weight: 500;">${index + 1}</td>
            <td style="padding: 12px 14px; border-bottom: 1px solid #edf2f7; font-weight: 600; color: #2d3748;">${row.nama || '-'}</td>
            <td style="padding: 12px 14px; border-bottom: 1px solid #edf2f7; color: #4a5568;">${formattedTgl}</td>
            <td style="padding: 12px 14px; border-bottom: 1px solid #edf2f7; color: #4a5568;">${row.jam || '-'}</td>
        </tr>`;
    });

    if (data.length === 0) {
        htmlTabel = `<tr><td colspan="4" style="text-align: center; padding: 25px; color: #718096;">Belum ada peserta terdaftar.</td></tr>`;
    }
    
    if (tabelBody) {
        tabelBody.innerHTML = htmlTabel;
    }

    // Paksa styling tabel agar tampil modern & elegan
    const tableElement = tabelBody ? tabelBody.closest('table') : null;
    if (tableElement) {
        tableElement.style.width = '100%';
        tableElement.style.borderCollapse = 'collapse';
        tableElement.style.fontSize = '14px';
        tableElement.style.backgroundColor = '#ffffff';
        tableElement.style.borderRadius = '10px';
        tableElement.style.overflow = 'hidden';
        tableElement.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
        
        const thead = tableElement.querySelector('thead');
        if (thead) {
            thead.style.backgroundColor = '#f8fafc';
            thead.style.color = '#475569';
            const ths = thead.querySelectorAll('th');
            ths.forEach(th => {
                th.style.padding = '14px';
                th.style.borderBottom = '2px solid #e2e8f0';
                th.style.textAlign = 'left';
                th.style.fontSize = '12px';
                th.style.textTransform = 'uppercase';
                th.style.letterSpacing = '0.5px';
            });
            if (ths[0]) ths[0].style.textAlign = 'center';
        }
    }

    // Update opsi dropdown tanggal dan info kuota
    if (selectTanggalForm) {
        const options = selectTanggalForm.querySelectorAll('option');
        let infoHtml = "<b>Status Sisa Kuota:</b><ul style='margin: 8px 0 15px 20px; padding: 0; color: #4a5568;'>";

        options.forEach(option => {
            let tglValue = option.value; // Contoh: "30 Oktober 2026"
            if (tglValue && tglValue !== "") {
                let jumlahPendaftar = countMap[tglValue] || 0;
                let sisaKuota = MAX_KUOTA - jumlahPendaftar;
                
                if (jumlahPendaftar >= MAX_KUOTA) {
                    option.disabled = true;
                    option.text = tglValue + " (PENUH - 13/13)";
                    infoHtml += `<li style="margin-bottom: 4px;">${tglValue}: <span style="color: #e53e3e; font-weight: bold;">Penuh (13/13)</span></li>`;
                } else {
                    option.disabled = false;
                    option.text = tglValue + ` (${jumlahPendaftar}/13 - Sisa ${sisaKuota})`;
                    infoHtml += `<li style="margin-bottom: 4px;">${tglValue}: Tersisa <b>${sisaKuota}</b> slot (${jumlahPendaftar}/13)</li>`;
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
