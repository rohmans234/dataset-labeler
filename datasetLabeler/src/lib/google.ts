import { google } from 'googleapis';

/**
 * Fungsi untuk mendapatkan autentikasi Google Service Account
 */
export const getGoogleAuth = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      // Memastikan karakter newline pada private key terbaca dengan benar
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });
  return auth;
};

// Inisialisasi instance Drive dan Sheets secara global
export const drive = google.drive({ version: 'v3', auth: getGoogleAuth() });
export const sheets = google.sheets({ version: 'v4', auth: getGoogleAuth() });

/**
 * Mengambil daftar file yang belum dilabeli dari folder tertentu
 */
export async function getUnlabeledFiles() {
  const response = await drive.files.list({
    q: `'${process.env.ID_FOLDER_ALL}' in parents and trashed = false`,
    fields: 'files(id, name)',
  });
  return response.data.files || [];
}

/**
 * Memperbarui data pengguna di Google Sheets berdasarkan Email
 */
export async function updateUserInSheet(email: string, updatedData: { name?: string, role?: string }) {
  // Menggunakan instance 'sheets' yang sudah didefinisikan di atas
  const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim(); 
  const range = 'users!A2:D'; // Mengambil data mulai dari baris 2 (melewati header)

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    
    // Cari index baris berdasarkan email (Kolom A / indeks 0)
    const rowIndex = rows.findIndex(row => row[0]?.trim() === email.trim());

    if (rowIndex === -1) {
      throw new Error('User tidak ditemukan di spreadsheet');
    }

    // Update data pada array lokal (indeks disesuaikan dengan range A2:D)
    // Kolom C (indeks 2) = Role, Kolom D (indeks 3) = Name
    if (updatedData.role) rows[rowIndex][2] = updatedData.role.toUpperCase().trim();
    if (updatedData.name) rows[rowIndex][3] = updatedData.name.trim();

    // Karena range dimulai dari A2, maka nomor baris asli di Sheets adalah rowIndex + 2
    const actualRowNumber = rowIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `users!A${actualRowNumber}:D${actualRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rows[rowIndex]],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating sheet:", error);
    throw error;
  }
}