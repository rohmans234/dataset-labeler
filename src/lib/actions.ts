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
  const user = 'Zaid'; 

  const folderIds: Record<string, string | undefined> = {
    'mumtaz': process.env.ID_FOLDER_MUMTAZ?.trim(),
    'jayyid_jiddan': process.env.ID_FOLDER_JAYYID_JIDDAN?.trim(),
    'jayyid': process.env.ID_FOLDER_JAYYID?.trim(),
    'maqbul': process.env.ID_FOLDER_MAQBUL?.trim(),
    'rasib': process.env.ID_FOLDER_RASIB?.trim(),
  };

  try {
    // 1. Ambil metadata file
    const file = await drive.files.get({ 
      fileId, 
      fields: 'id, name, parents',
      supportsAllDrives: true 
    });
    
    const oldName = file.data.name;
    const destFolderId = folderIds[label];
    
    // AMBIL ID FOLDER ALL DARI ENV SEBAGAI CADANGAN
    const folderAllId = process.env.NEXT_PUBLIC_ID_FOLDER_ALL?.trim();

    // JIKA API tidak memberikan parents, gunakan folderAllId dari env
    const currentParents = (file.data.parents && file.data.parents.length > 0) 
      ? file.data.parents.join(',') 
      : folderAllId;

    if (!destFolderId) throw new Error(`Folder tujuan ${label} tidak ditemukan.`);
    if (!currentParents) throw new Error("ID folder asal (ALL) tidak ditemukan di .env");

    const newName = `01_${user}_${label}`;

    // 2. EKSEKUSI MOVE (CUT & PASTE)
    console.log(`Memindahkan ${oldName} dari ${currentParents} ke ${destFolderId}...`);
    
    await drive.files.update({
      fileId: fileId,
      addParents: destFolderId,      // Paste
      removeParents: currentParents, // Cut
      supportsAllDrives: true,
      requestBody: {
        name: newName,               // Rename
      },
    });

    // 3. Catat ke Google Sheets
    const spreadsheetId = process.env.ID_SPREADSHEET_LOG?.trim();
    if (spreadsheetId) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'logs!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[new Date().toLocaleString('id-ID'), user, oldName, newName, label]],
        },
      });
    }

    revalidatePath('/dashboard');
    return { success: true, message: `Berhasil! File pindah ke ${label}` };

  } catch (error: any) {
    console.error('Labeling Error:', error.message);
    
    // Kasus spesifik untuk Drive teman (Restriksi Move)
    if (error.message.includes('parents')) {
      return { 
        success: false, 
        message: "Gagal (Izin). Minta temanmu mencentang 'Editors can change permissions' di folder ALL." 
      };
    }
    return { success: false, message: "Gagal: " + error.message };
  }
}