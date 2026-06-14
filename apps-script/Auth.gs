function handleLogin(email, password) {
  if (!email || !password) return createErrorResponse(400, "Email dan password wajib diisi.");
  
  const sheet = getSheet("tb_users");
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createErrorResponse(401, "Akun tidak ditemukan. Silakan hubungi admin.");
  
  const headers = data[0];
  const emailCol = headers.indexOf("email");
  const passCol = headers.indexOf("password_hash");
  const idCol = headers.indexOf("user_id");
  const nameCol = headers.indexOf("full_name");
  const currCol = headers.indexOf("currency");
  const picCol = headers.indexOf("profile_picture_url");
  
  if (emailCol === -1 || passCol === -1) return createErrorResponse(500, "Struktur tabel tb_users tidak valid.");
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[emailCol]).trim().toLowerCase() === String(email).trim().toLowerCase()) {
      // Email ditemukan, cek password
      if (String(row[passCol]).trim() === String(password).trim()) {
        // Generate and save Session Token
        const sessionToken = generateUUID();
        let sessionCol = headers.indexOf("session_token");
        if (sessionCol === -1) {
           sheet.getRange(1, headers.length + 1).setValue("session_token");
           sessionCol = headers.length;
        }
        sheet.getRange(i + 1, sessionCol + 1).setValue(sessionToken);

        // Password cocok → login sukses
        return createSuccessResponse(200, "Login berhasil!", {
          authToken: sessionToken,
          user: {
            full_name: row[nameCol] || '',
            email: row[emailCol] || '',
            currency: row[currCol] || 'IDR',
            profile_picture_url: (picCol !== -1 ? row[picCol] : '') || ''
          }
        });
      } else {
        // Password salah
        return createErrorResponse(401, "Password salah. Silakan coba lagi.");
      }
    }
  }
  
  // Email tidak ditemukan
  return createErrorResponse(401, "Email tidak terdaftar. Silakan hubungi admin.");
}


function handleUpdateProfile(authToken, payload) {
  const userId = getUserIdFromToken(authToken);
  if (!userId) return createErrorResponse(401, "Unauthorized");
  
  let profileUrl = payload.profile_picture_url;
  
  // If payload contains base64 image, upload to Drive
  if (payload.base64_image) {
    try {
      const parts = payload.base64_image.split(',');
      const contentType = parts[0].split(':')[1].split(';')[0];
      const encoded = parts[1];
      const blob = Utilities.newBlob(Utilities.base64Decode(encoded), contentType, "Profile_" + userId + "_" + new Date().getTime());
      
      const folders = DriveApp.getFoldersByName("Finoza_Profiles");
      let folder;
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder("Finoza_Profiles");
        folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      }
      
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      profileUrl = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w500";
    } catch(e) {
      return createErrorResponse(500, "Gagal mengunggah foto: " + e.message);
    }
  }

  const sheet = getSheet("tb_users");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColIndex = headers.indexOf("user_id");
  let profilePicColIndex = headers.indexOf("profile_picture_url");
  
  if (profilePicColIndex === -1) {
    // Add column if it doesn't exist
    sheet.getRange(1, headers.length + 1).setValue("profile_picture_url");
    profilePicColIndex = headers.length;
  }

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(userId)) {
      if (profileUrl) {
         sheet.getRange(i + 1, profilePicColIndex + 1).setValue(profileUrl);
      }
      if (payload.full_name) {
         const nameColIndex = headers.indexOf("full_name");
         if (nameColIndex !== -1) sheet.getRange(i + 1, nameColIndex + 1).setValue(sanitizeInput(payload.full_name));
      }
      if (payload.password) {
         const passColIndex = headers.indexOf("password");
         if (passColIndex !== -1) sheet.getRange(i + 1, passColIndex + 1).setValue(payload.password);
      }
      return createSuccessResponse(200, "Profil berhasil diperbarui", { profile_picture_url: profileUrl, full_name: payload.full_name });
    }
  }
  return createErrorResponse(404, "User not found");
}


