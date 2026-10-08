document.getElementById('pendaftaranForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Ambil nilai dari form input
    const formData = {
        nama: document.getElementById('nama').value,
        alamat: document.getElementById('alamat').value,
        telepon: document.getElementById('telepon').value,
        tanggal: document.getElementById('tanggal').value,
        jam: document.getElementById('jam').value,
        keterangan: document.getElementById('keterangan').value
    };

    // Tampilkan status loading / nonaktifkan tombol
    const submitBtn = document.getElementById('submitBtn');
    const loadingDiv = document.getElementById('loading');
    const responseMessage = document.getElementById('responseMessage');

    submitBtn.disabled = true;
    loadingDiv.style.display = 'block';
    responseMessage.textContent = '';

    // Ganti URL di bawah dengan URL Deployment Web App Google Apps Script Anda
    const scriptURL = 'https://script.google.com/macros/s/AKfycbw34g7tWMu74yOMZd3BZ_Wix6qTODtd7q5G7ZfeneyOmlP3kODDSnYiTHExsbNKJZEWPQ/exec';

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // Diperlukan jika mengirim ke Google Apps Script dari domain luar
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(() => {
        // Karena mode 'no-cors', respons mentah tidak bisa dibaca langsung, 
        // namun jika berhasil sampai sini, data umumnya sudah masuk ke spreadsheet.
        loadingDiv.style.display = 'none';
        submitBtn.disabled = false;
        
        responseMessage.style.color = 'green';
        responseMessage.textContent = 'Pendaftaran berhasil dikirim!';
        
        // Reset form setelah berhasil
        document.getElementById('pendaftaranForm').reset();
    })
    .catch(error => {
        loadingDiv.style.display = 'none';
        submitBtn.disabled = false;
        
        responseMessage.style.color = 'red';
        responseMessage.textContent = 'Terjadi kesalahan: ' + error;
    });
});
