function doPost(e) {
  try {
    var dataInput = JSON.parse(e.postData.contents);

    var ss = SpreadsheetApp.openById("1A9TRWienuwB0baIHNWzIsHKgiEZ_5ESztm4k3XQ_hnk");
    var sheet = ss.getSheetByName("DATA");
    var data = sheet.getDataRange().getValues();

    var inputNama = dataInput.nama ? dataInput.nama.trim().toUpperCase() : "";
    var inputEmail = dataInput.email ? dataInput.email.trim().toLowerCase() : "";
    var inputTelepon = dataInput.telepon ? dataInput.telepon.trim() : "";
    var inputKategori = dataInput.kategori ? dataInput.kategori.trim() : "";

    // Pengecekan Duplikasi Data
    for (var i = 1; i < data.length; i++) {
      var existingNama = data[i][1] ? data[i][1].toString().trim().toUpperCase() : "";
      var existingEmail = data[i][2] ? data[i][2].toString().trim().toLowerCase() : "";
      var existingTelepon = data[i][3] ? data[i][3].toString().trim().replace(/^'/, "") : "";

      if (existingNama === inputNama) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "NAMA SUDAH TERDAFTAR" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      if (existingEmail === inputEmail) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "EMAIL ADA YANG SAMA" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      if (existingTelepon === inputTelepon) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "TELEPON SAMA DENGAN YANG SUDAH DAFTAR" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Simpan data jika aman
    var nomorTeleponFormat = "'" + inputTelepon;
    sheet.appendRow([new Date(), inputNama, inputEmail, nomorTeleponFormat, inputKategori]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Sukses" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
