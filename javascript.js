<script>
    document.getElementById('registrationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        var submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Memproses...';
        
        var formData = {
            nama: document.getElementById('nama').value.toUpperCase(),
            email: document.getElementById('email').value,
            telepon: document.getElementById('telepon').value,
            kategori: document.getElementById('kategori').value
        };
        
        // Memanggil fungsi backend di Google Apps Script (Kode.gs)
        google.script.run
            .withSuccessHandler(function(response) {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Daftar Sekarang';
                document.getElementById('registrationForm').reset();
                
                // Munculkan popup sukses (Hijau)
                document.getElementById('successPopup').style.display = 'flex';
            })
                        .withFailureHandler(function(error) {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Daftar Sekarang';
                
                // 1. Bersihkan dulu warna merah dari semua kolom input sebelum pengecekan baru
                document.getElementById('nama').classList.remove('input-error');
                document.getElementById('email').classList.remove('input-error');
                document.getElementById('telepon').classList.remove('input-error');
                
                var pesanPemberitahuan = 'Terjadi gangguan sistem. Silakan coba lagi.';
                
                // 2. Cek jenis error dan beri warna merah 40% pada kolom yang sesuai
                if (error.message.includes("NAMA SUDAH TERDAFTAR")) {
                    pesanPemberitahuan = 'Wah nama anda sudah ada di data kami.';
                    document.getElementById('nama').classList.add('input-error'); // Kolom Nama jadi merah
                } else if (error.message.includes("EMAIL ADA YANG SAMA")) {
                    pesanPemberitahuan = 'Alamat Email tersebut telah digunakan. Silakan gunakan email aktif lainnya.';
                    document.getElementById('email').classList.add('input-error'); // Kolom Email jadi merah
                } else if (error.message.includes("TELEPON SAMA DENGAN YANG SUDAH DAFTAR")) {
                    pesanPemberitahuan = 'Nomor WhatsApp tersebut sudah terdaftar. Tidak boleh mendaftar lebih dari satu kali.';
                    document.getElementById('telepon').classList.add('input-error'); // Kolom WA jadi merah
                } else {
                    pesanPemberitahuan = error.message;
                }
                
                // Munculkan popup duplikat merah
                document.getElementById('duplicateMessage').innerText = pesanPemberitahuan;
                document.getElementById('duplicatePopup').style.display = 'flex';
            })
            .prosesPendaftaran(formData);
    });

    // Aksi Tombol Tutup Popup Sukses
    document.getElementById('closeSuccessBtn').addEventListener('click', function() {
        document.getElementById('successPopup').style.display = 'none';
    });

    // Aksi Tombol Tutup Popup Duplikat
    document.getElementById('closeDuplicateBtn').addEventListener('click', function() {
        document.getElementById('duplicatePopup').style.display = 'none';
    });
    
        // Menghilangkan warna merah saat pendaftar mulai memperbaiki isian kolom
    document.getElementById('nama').addEventListener('input', function() { this.classList.remove('input-error'); });
    document.getElementById('email').addEventListener('input', function() { this.classList.remove('input-error'); });
    document.getElementById('telepon').addEventListener('input', function() { this.classList.remove('input-error'); });

</script>
