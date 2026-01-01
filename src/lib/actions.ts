'use server';

import { revalidatePath } from 'next/cache';
import { drive, sheets } from './google';

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
    
    // FILTER: Hanya ambil file yang NAMANYA tidak diawali dengan label
    const filteredFiles = allFiles.filter(file => {
      // TypeScript Fix: Pastikan name ada
      if (!file.name) return false;

      const name = file.name.toUpperCase();
      return !name.startsWith('MUMTAZ_') && 
             !name.startsWith('JAYYID_') && 
             !name.startsWith('MAQBUL_') && 
             !name.startsWith('RASIB_');
    });

    return { success: true, data: filteredFiles };
  } catch (error: any) {
    return { success: false, data: [], message: error.message };
  }
}

/**
 * Proses Labeling: HANYA GANTI NAMA (RENAME)
 */
export async function labelFileAction(formData: FormData) {
  const fileId = formData.get('fileId') as string;
  const label = formData.get('label') as string; 
  const user = 'Zaid'; 
  const timestamp = new Date().getTime().toString().slice(-4);

  try {
    const file = await drive.files.get({ 
      fileId, 
      fields: 'name',
      supportsAllDrives: true 
    });
    
    // TypeScript Fix: Pastikan oldName tidak null
    const oldName = file.data.name || 'Untitled';
    const formattedLabel = label.toUpperCase();
    const newName = `${formattedLabel}_${user}_${timestamp}`;

    await drive.files.update({
      fileId: fileId,
      supportsAllDrives: true,
      requestBody: { name: newName },
    });

    const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim();
    if (spreadsheetId) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'logs!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[new Date().toLocaleString('id-ID'), user, oldName, newName, formattedLabel]],
        },
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/history');
    
    return { success: true, message: `Berhasil! Nama baru: ${newName}` };

  } catch (error: any) {
    console.error('Rename Error:', error.message);
    return { success: false, message: "Gagal ganti nama: " + error.message };
  }
}

/**
 * Mengambil Riwayat dari Google Sheets
 */
export async function fetchHistoryAction() {
  try {
    const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim();
    if (!spreadsheetId) throw new Error("ID_SPREADSHEET_LOG tidak ditemukan");

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'logs!A2:E', 
    });

    const rows = response.data.values || [];
    const history = rows.map((row, index) => ({
      id: `hist-${index}`,
      timestamp: row[0] || '',
      user: row[1] || '',
      originalName: row[2] || '',
      newName: row[3] || '',
      label: row[4] || '',
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
    // 1. Kembalikan nama file di Google Drive ke Nama Asli
    await drive.files.update({
      fileId: fileId,
      supportsAllDrives: true,
      requestBody: { name: originalName },
    });

    // 2. (Opsional) Kamu bisa hapus baris terakhir di Sheets secara manual, 
    // tapi lebih aman tambahkan baris "UNDO" saja agar log tetap jujur.
    const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim();
    if (spreadsheetId) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'logs!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[new Date().toLocaleString('id-ID'), 'SYSTEM', originalName, 'RESTORED', 'UNDO']],
        },
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/history');
    
    return { success: true, message: "Berhasil dibatalkan!" };
  } catch (error: any) {
    console.error('Undo Error:', error.message);
    return { success: false, message: "Gagal Undo: " + error.message };
  }
}