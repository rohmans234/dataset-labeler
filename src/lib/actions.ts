// src/lib/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { drive, sheets } from './google';

/**
 * Mengambil daftar file dari folder ALL
 */
export async function fetchFilesAction() {
  const folderAllId = process.env.NEXT_PUBLIC_ID_FOLDER_ALL?.trim();

  if (!folderAllId) {
    console.error('ERROR: NEXT_PUBLIC_ID_FOLDER_ALL tidak terbaca');
    return { success: false, data: [], message: 'Konfigurasi Folder ALL tidak ditemukan.' };
  }

  try {
    const response = await drive.files.list({
      q: `'${folderAllId}' in parents and trashed = false`,
      // FIX: Tambahkan mimeType di fields agar tidak undefined
      fields: 'files(id, name, mimeType)', 
      pageSize: 50,
    });

    // Log untuk memastikan tipe file (Shortcut atau Asli)
    console.log("Daftar File:", response.data.files?.map(f => `${f.name} (${f.mimeType})`));

    return { success: true, data: response.data.files || [] };
  } catch (error: any) {
    console.error('Drive API Error:', error.message);
    return { success: false, data: [], message: error.message };
  }
}

/**
 * Proses Labeling
 */
export async function labelFileAction(formData: FormData) {
  const fileId = formData.get('fileId') as string;
  const label = formData.get('label') as string;
  const isUndo = formData.get('undo') === 'true';
  const user = 'Zaid'; 

  const folderIds: Record<string, string | undefined> = {
    'mumtaz': process.env.ID_FOLDER_MUMTAZ?.trim(),
    'jayyid_jiddan': process.env.ID_FOLDER_JAYYID_JIDDAN?.trim(),
    'jayyid': process.env.ID_FOLDER_JAYYID?.trim(),
    'maqbul': process.env.ID_FOLDER_MAQBUL?.trim(),
    'rasib': process.env.ID_FOLDER_RASIB?.trim(),
  };

  try {
    // 1. Ambil metadata file secara spesifik
    const file = await drive.files.get({ 
      fileId: fileId, 
      fields: 'id, name, parents' 
    });
    
    const oldName = file.data.name;
    const currentParents = (file.data.parents || []).join(',');

    // --- LOGIKA LABELING (MOVE) ---
    const destFolderId = folderIds[label];
    if (!destFolderId) throw new Error(`Folder untuk label ${label} tidak ditemukan.`);
    const newName = `01_${user}_${label}`;

    // 2. EKSEKUSI PINDAH & RENAME
    await drive.files.update({
      fileId: fileId,
      addParents: destFolderId,      // Masukkan ke folder tujuan
      removeParents: currentParents, // Cabut dari folder asal (ALL)
      // PENTING: Untuk Drive pribadi, parameter ini membantu memperjelas aksi
      supportsAllDrives: true,
      requestBody: { 
        name: newName 
      },
    });

    // 3. Catat ke Google Sheets
    const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim();
    if (spreadsheetId) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: 'logs!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[new Date().toLocaleString('id-ID'), user, oldName, newName, label]],
        },
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/history');
    return { success: true, message: `Berhasil! File sudah di folder ${label}` };

  } catch (error: any) {
    console.error('Labeling Error:', error.message);
    
    // Jika masih error "parents", berarti temanmu HARUS melakukan setting di Drive-nya
    if (error.message.includes('parents')) {
      return { 
        success: false, 
        message: "Gagal memindah. Temanmu (Owner Drive) harus memberikan izin 'Editor' dan mencentang 'Editors can change permissions' di folder tersebut." 
      };
    }
    
    return { success: false, message: error.message };
  }
}