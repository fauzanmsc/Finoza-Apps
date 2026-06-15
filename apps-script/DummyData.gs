function handleGenerateDummyData(authToken) {
  return createSuccessResponse(200, "Silakan jalankan setupDummyData dari editor.", null);
}

// ==========================================
// JALANKAN FUNGSI INI DARI EDITOR UNTUK SETUP
// ==========================================
function setupDummyData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup User (Admin Finoza)
  let userSheet = getSheet('tb_users');
  let userData = userSheet.getDataRange().getValues();
  
  let userId = 'USR-1';
  let sessionToken = generateUUID();
  let userExists = false;
  
  if (userData.length > 1) {
    for (let i = 1; i < userData.length; i++) {
      if (userData[i][1] === 'admin@finoza.com') { // Email
        userId = userData[i][0]; // user_id
        sessionToken = userData[i][5] || sessionToken; // session_token
        userSheet.getRange(i + 1, 6).setValue(sessionToken); // Update token
        userExists = true;
        break;
      }
    }
  }
  
  if (!userExists) {
    userSheet.appendRow([userId, 'admin@finoza.com', 'Admin Finoza', '', 'password123', sessionToken, new Date().toISOString()]);
  }
  
  // 2. Setup Schedules Dummy Data
  let scheduleSheet = getSheet('tb_schedules');
  const now = new Date();
  
  // Create 3 dummy schedules
  scheduleSheet.appendRow(['SCH-' + generateUUID().substring(0,8), userId, 'Tagihan Listrik', 500000, new Date(now.getFullYear(), now.getMonth(), 20).toISOString().split('T')[0], 'Pending', 'Bayar lewat m-banking', now.toISOString()]);
  
  scheduleSheet.appendRow(['SCH-' + generateUUID().substring(0,8), userId, 'Cicilan Mobil', 3500000, new Date(now.getFullYear(), now.getMonth(), 25).toISOString().split('T')[0], 'Paid', 'Sudah lunas', now.toISOString()]);
  
  scheduleSheet.appendRow(['SCH-' + generateUUID().substring(0,8), userId, 'Langganan Internet', 350000, new Date(now.getFullYear(), now.getMonth(), 28).toISOString().split('T')[0], 'Pending', 'Indihome', now.toISOString()]);
  
  Logger.log("==========================================");
  Logger.log("BERHASIL! SETUP DUMMY DATA SELESAI.");
  Logger.log("Email Login : admin@finoza.com");
  Logger.log("Password    : password123");
  Logger.log("Silakan Log Out dari aplikasi Finoza, lalu Log In ulang dengan data di atas.");
  Logger.log("Cek menu Jadwal & To-Do untuk melihat data dumy.");
  Logger.log("==========================================");
}
