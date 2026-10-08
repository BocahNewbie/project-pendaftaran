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

window.handleKuotaData = function(data) {
    const selectTanggalForm = document.getElementById('tanggal');
    const tabelBody = document.getElementById('tabelPesertaBody');
    const infoKuotaContainer = document.getElementById('infoKuotaContainer');
    
    if (!Array.isArray(data)) return;

    const countMap = {};
    let htmlTabel = "";
    
    // Hitung jumlah pendaftar per tanggal & susun baris tabel peserta
    data.forEach((row, index) => {
        let tgl = row.tanggal ? row.tanggal.toString().trim() : "";
        if (tgl) {
            countMap[tgl] = (countMap[tgl] || 0) + 1;
        }

        htmlTabel += `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${index + 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${row.nama || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${row.tanggal || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${row.jam || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${row.keterangan || '-'}</td>
        </tr>`;
    });

    if (data.length === 0) {
        htmlTabel = `<tr><td colspan="5" style="text-align: center; padding: 15px;">Belum ada peserta terdaftar.</td></tr>`;
    }
    
    if (tabelBody) {
        tabelBody.innerHTML = htmlTabel;
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
        setTimeout(loadDataKuota, 1500); // Refresh data realtime setelah daftar
    })
    .catch(error => {
        loadingDiv.style.display = 'none';
        submitBtn.disabled = false;
        alert('Terjadi kesalahan: ' + error);
    });
});
