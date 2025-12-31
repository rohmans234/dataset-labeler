// src/lib/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { drive, sheets } from './google';

export async function fetchFilesAction() {
  // SESUAIKAN: Gunakan nama yang ada di .env kamu
  const folderAllId = process.env.NEXT_PUBLIC_ID_FOLDER_ALL;

  if (!folderAllId) {
    console.error('ERROR: NEXT_PUBLIC_ID_FOLDER_ALL tidak terbaca dari .env');
    return { success: false, data: [], message: 'Konfigurasi Server Error.' };
  }

  try {
    const response = await drive.files.list({
      q: `'${folderAllId.trim()}' in parents and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 50,
    });

    return { success: true, data: response.data.files || [] };
  } catch (error: any) {
    console.error('Drive API Error:', error.message);
    return { success: false, data: [], message: error.message };
  }
}

export async function labelFileAction(formData: FormData) {
  const fileId = formData.get('fileId') as string;
  const label = formData.get('label') as string;
  const isUndo = formData.get('undo') === 'true';
  const user = 'Zaid'; 

  // Mapping Folder (Pastikan ID_FOLDER_... di .env sudah benar)
  const folderIds: Record<string, string | undefined> = {
    'mumtaz': process.env.ID_FOLDER_MUMTAZ,
    'jayyid_jiddan': process.env.ID_FOLDER_JAYYID_JIDDAN,
    'jayyid': process.env.ID_FOLDER_JAYYID,
    'maqbul': process.env.ID_FOLDER_MAQBUL,
    'rasib': process.env.ID_FOLDER_RASIB,
  };

  try {
    if (isUndo) {
      const targetFolder = process.env.NEXT_PUBLIC_ID_FOLDER_ALL;
      if (!targetFolder) throw new Error("ID Folder ALL tidak ditemukan");

      const file = await drive.files.get({ fileId, fields: 'parents' });
      const currentParents = file.data.parents?.join(',') || '';
      
      await drive.files.update({
        fileId: fileId,
        addParents: targetFolder,
        removeParents: currentParents,
      });

      revalidatePath('/dashboard');
      return { success: true, message: 'Berhasil dikembalikan.' };
    }

    const destFolderId = folderIds[label];
    if (!destFolderId) throw new Error(`Folder untuk ${label} belum diatur di .env`);

    const file = await drive.files.get({ fileId, fields: 'name, parents' });
    const oldName = file.data.name;
    const newName = `01_${user}_${label}`;

    // 1. Rename & Move
    await drive.files.update({
      fileId: fileId,
      addParents: destFolderId,
      removeParents: file.data.parents?.join(','),
      requestBody: { name: newName },
    });

    // 2. Log ke Sheets
    const spreadsheetId = process.env.ID_SPREADSHEET_LOG;
    if (spreadsheetId) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: 'logs!A:E',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[new Date().toLocaleString('id-ID'), user, oldName, newName, label]],
        },
      });
    }

    revalidatePath('/dashboard');
    return { success: true, message: 'Berhasil melabeli!' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}