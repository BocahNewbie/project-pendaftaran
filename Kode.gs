function doPost(e) {
  try {
    var dataInput = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById("1A9TRWienuwB0baIHNWzIsHKgiEZ_5ESztm4k3XQ_hnk");
    var sheet = ss.getSheetByName("DATA");
    var data = sheet.getDataRange().getValues();
    
    // Menangkap input dari form
    var inputNama = dataInput.nama ? dataInput.nama.trim().toUpperCase() : "";
    var inputAlamat = dataInput.alamat ? dataInput.alamat.trim().toUpperCase() : "";
    var inputTelepon = dataInput.telepon ? dataInput.telepon.trim() : "";
    var inputTanggal = dataInput.tanggal ? dataInput.tanggal.trim() : "";
    var inputJam = dataInput.jam ? dataInput.jam.trim() : "";
    var inputKeterangan = dataInput.keterangan ? dataInput.keterangan.trim() : "Belum";

    // Pengecekan Duplikasi Data (Berdasarkan Nama atau No WA)
    for (var i = 1; i < data.length; i++) {
      var existingNama = data[i][1] ? data[i][1].toString().trim().toUpperCase() : "";
      var existingTelepon = data[i][3] ? data[i][3].toString().trim().replace(/^'/, "") : "";
      
      if (existingNama === inputNama) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "NAMA SUDAH TERDAFTAR" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      if (existingTelepon === inputTelepon) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "NO WA SAMA DENGAN YANG SUDAH DAFTAR" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Format No WA agar tidak hilang angka nol di depannya pada Google Sheets
    var nomorTeleponFormat = "'" + inputTelepon;

    // Urutan kolom disesuaikan dengan header spreadsheet:
    // Kolom A: Timestamp | Kolom B: Nama | Kolom C: Alamat | Kolom D: No WA | Kolom E: Tanggal | Kolom F: Jam Treatment | Kolom G: Keterangan
    sheet.appendRow([
      new Date(), 
      inputNama, 
      inputAlamat, 
      nomorTeleponFormat, 
      inputTanggal, 
      inputJam, 
      inputKeterangan
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Sukses" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
