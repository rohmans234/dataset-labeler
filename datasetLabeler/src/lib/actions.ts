'use server';

import { revalidatePath } from 'next/cache';
import { drive, sheets, updateUserInSheet } from './google';

/**
 * Mengambil daftar file dari folder ALL
 */
export async function fetchFilesAction() {
  const folderAllId = process.env.NEXT_PUBLIC_ID_FOLDER_ALL?.trim();
  if (!folderAllId) return { success: false, data: [] };

  try {
    const response = await drive.files.list({
      q: `'${folderAllId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const allFiles = response.data.files || [];

    // FILTER: Menyembunyikan file yang sudah memiliki prefix label
    const filteredFiles = allFiles.filter(file => {
      if (!file.name) return false;
      const name = file.name.toUpperCase();
      return !['MUMTAZ_', 'JAYYID_JIDDAN_', 'JAYYID_', 'MAQBUL_', 'RASIB_'].some(label => 
        name.startsWith(label)
      );
    });

    return { success: true, data: filteredFiles };
  } catch (error: any) {
    return { success: false, data: [], message: error.message };
  }
}

/**
 * Proses Labeling: Rename File, Validasi Feedback, & Catat Log
 */
export async function labelFileAction(formData: FormData) {
  const fileId = formData.get('fileId') as string;
  const label = formData.get('label') as string; 
  const feedback = formData.get('feedback') as string; // Ambil feedback
  const user = 'Zaid';
  const timestamp = new Date().getTime().toString().slice(-4);

  // VALIDASI WAJIB FEEDBACK (Server Side)
  if (!feedback || feedback.trim().length < 3) {
    return { success: false, message: "Gagal: Feedback wajib diisi (minimal 3 karakter)." };
  }

  try {
    const file = await drive.files.get({ 
      fileId, 
      fields: 'name',
      supportsAllDrives: true 
    });
    
    const oldName = file.data.name || 'Untitled';
    const formattedLabel = label.toUpperCase();
    const newName = `${formattedLabel}_${user}_${timestamp}`;

    // 1. Rename File di Drive
    await drive.files.update({
      fileId: fileId,
      supportsAllDrives: true,
      requestBody: { name: newName },
    });

    // 2. Catat ke Sheets 
    const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim();
    if (spreadsheetId) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'logs!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          // URUTAN KOLOM: Waktu, Pelabel, Nama Asli, Nama Baru, Label, Feedback, File ID
          values: [[
            new Date().toLocaleString('id-ID'), 
            user, 
            oldName, 
            newName, 
            formattedLabel,
            feedback.trim(),
            fileId
          ]],
        },
      });
    }

    // Refresh Cache Next.js
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/history');
    revalidatePath('/admin');

    return { success: true, message: `Berhasil! Nama baru: ${newName}` };
  } catch (error: any) {
    console.error('Labeling Error:', error.message);
    return { success: false, message: "Gagal API: " + error.message };
  }
}

/**
 * Mengambil Riwayat dari Google Sheets (Sekarang Kolom A-G karena tambah feedback)
 */
export async function fetchHistoryAction() {
  try {
    const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim();
    if (!spreadsheetId) throw new Error("ID_SPREADSHEET_LOG tidak ditemukan");

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'logs!A2:G', // Diperluas ke G untuk mengambil feedback & fileId
    });

    const rows = response.data.values || [];
    const history = rows.map((row, index) => ({
      id: `hist-${index}`,
      timestamp: row[0] || '',
      user: row[1] || '',
      originalName: row[2] || '',
      newName: row[3] || '',
      label: row[4] || '',
      feedback: row[5] || '',
      fileId: row[6] || '',
    })).reverse();

    return { success: true, data: history };
  } catch (error: any) {
    return { success: false, data: [], message: error.message };
  }
}

/**
 * Membatalkan Label Terakhir (Undo)
 */
export async function undoLabelAction(formData: FormData) {
  const fileId = formData.get('fileId') as string;
  const originalName = formData.get('originalName') as string;

  try {
    await drive.files.update({
      fileId: fileId,
      supportsAllDrives: true,
      requestBody: { name: originalName },
    });

    const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim();
    if (spreadsheetId) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'logs!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            new Date().toLocaleString('id-ID'), 
            'SYSTEM', 
            originalName, 
            'RESTORED', 
            'UNDO', 
            'Undo Action', 
            fileId
          ]],
        },
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/history');
    revalidatePath('/admin');

    return { success: true, message: "Berhasil dibatalkan!" };
  } catch (error: any) {
    return { success: false, message: "Gagal Undo: " + error.message };
  }
}

/**
 * Statistik untuk Admin Dashboard
 */
export async function fetchAdminStats() {
  try {
    const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim();
    if (!spreadsheetId) throw new Error("ID_SPREADSHEET_LOG tidak ditemukan");

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'logs!A2:E', // Tetap sampai E karena statistik hanya butuh kolom Label
    });

    const rows = (response.data.values || []).filter(row => row[4] !== 'UNDO');

    const distribution: Record<string, number> = {
      MUMTAZ: 0,
      JAYYID_JIDDAN: 0,
      JAYYID: 0,
      MAQBUL: 0,
      RASIB: 0
    };

    rows.forEach(row => {
      const label = row[4];
      if (label && distribution.hasOwnProperty(label)) {
        distribution[label]++;
      }
    });

    return {
      success: true,
      data: {
        totalLabeled: rows.length,
        distribution: Object.entries(distribution).map(([name, value]) => ({ name, value })),
        recentActivity: rows.slice(-5).reverse()
      }
    };
  } catch (error: any) {
    return { success: false, data: null, message: error.message };
  }
}

/**
 * Mendapatkan semua user dari Google Sheets (Admin Only)
 */
export async function fetchUsersAction() {
  try {
    const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'users!A2:E',
    });

    const rows = response.data.values || [];
    const users = rows.map((row, index) => ({
      id: index,
      email: row[0],
      role: row[2],
      name: row[3],
      status: row[4],
    }));

    return { success: true, data: users };
  } catch (error: any) {
    return { success: false, data: [], message: error.message };
  }
}

/**
 * Menambah User Baru (Admin Only)
 */
export async function createUserAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string; 
  const role = formData.get('role') as string;
  const name = formData.get('name') as string;

  try {
    const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'users!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[email, password, role, name, 'Active']],
      },
    });

    revalidatePath('/admin/users');
    return { success: true, message: "User berhasil ditambahkan" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Menghapus User (Admin Only)
 */
export async function deleteUserAction(email: string) {
  // Logika penghapusan di Google Sheets biasanya melibatkan pencarian row index 
  // lalu mengirimkan batchUpdate deleteDimension.
  // Untuk kemudahan starter, bisa menggunakan status 'Inactive'.
  try {
    const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim();
    // Cari row dan update kolom E (Status) menjadi 'Deleted'
    return { success: true, message: "User dinonaktifkan" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
export async function updateUserAction(email: string, formData: FormData) {
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;

  try {
    await updateUserInSheet(email, { name, role });
    revalidatePath('/admin/users'); // Refresh data di halaman admin
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal memperbarui user' };
  }
}