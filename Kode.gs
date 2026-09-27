function doGet() {
  // Mengubah pemanggilan template menjadi file bernama 'dashboard'
  return HtmlService.createTemplateFromFile('dashboard')
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setTitle('DAFTAR LOMBA')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Fungsi pembantu untuk menyisipkan file CSS dan JS terpisah
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function prosesPendaftaran(formData) {
  var ss = SpreadsheetApp.openById("1A9TRWienuwB0baIHNWzIsHKgiEZ_5ESztm4k3XQ_hnk");
  var sheet = ss.getSheetByName("DATA"); 
  
  // Ambil semua data yang ada di sheet saat ini
  var data = sheet.getDataRange().getValues();
  
  // Bersihkan data input dari spasi berlebih untuk akurasi pengecekan
  var inputNama = formData.nama.trim().toUpperCase();
  var inputEmail = formData.email.trim().toLowerCase();
  var inputTelepon = formData.telepon.trim();
  
  // Looping untuk memeriksa apakah ada data yang sama (mulai dari baris ke-2/indeks 1 untuk melewati header)
  for (var i = 1; i < data.length; i++) {
    var existingNama = data[i][1] ? data[i][1].toString().trim().toUpperCase() : "";
    var existingEmail = data[i][2] ? data[i][2].toString().trim().toLowerCase() : "";
    
    // Hilangkan tanda petik satu (') di awal nomor HP saat pengecekan jika ada
    var existingTelepon = data[i][3] ? data[i][3].toString().trim().replace(/^'/, "") : "";
    
    if (existingNama === inputNama) {
      throw new Error("NAMA SUDAH TERDAFTAR");
    }
    if (existingEmail === inputEmail) {
      throw new Error("EMAIL ADA YANG SAMA");
    }
    if (existingTelepon === inputTelepon) {
      throw new Error("TELEPON SAMA DENGAN YANG SUDAH DAFTAR");
    }
  }
  
  // Jika aman dan tidak ada duplikat, format nomor HP lalu simpan data
  var nomorTeleponFormat = "'" + inputTelepon;
  sheet.appendRow([
    new Date(), 
    inputNama,
    formData.email.trim(), // Tetap simpan format asli email inputan
    nomorTeleponFormat, 
    formData.kategori
  ]);
  
  return "Sukses";
}

