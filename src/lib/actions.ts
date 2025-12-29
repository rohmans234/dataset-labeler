'use server';

import { revalidatePath } from 'next/cache';
import { getDriveClient, getSheetsClient } from './google';
import { labels } from './data';

// Helper function untuk mendapatkan ID folder tujuan berdasarkan nama label
const getFolderIdByLabel = (labelName: string): string => {
    const labelMap: { [key: string]: string | undefined } = {
        'Mumtaz': process.env.ID_FOLDER_MUMTAZ,
        'Jayyid Jiddan': process.env.ID_FOLDER_JAYYID_JIDDAN,
        'Jayyid': process.env.ID_FOLDER_JAYYID,
        'Maqbul': process.env.ID_FOLDER_MAQBUL,
        'Rasib': process.env.ID_FOLDER_RASIB,
    };
    return labelMap[labelName] || '';
};

export async function labelFileAction(formData: FormData): Promise<{ success: boolean; message: string; originalParent?: string; }> {
  const fileId = formData.get('fileId') as string;
  const labelId = formData.get('label') as string;
  const isUndo = formData.get('undo') === 'true';
  const originalParent = formData.get('originalParent') as string || process.env.ID_FOLDER_ALL as string;

  const user = 'Zaid'; // TODO: Ganti dengan data sesi dari NextAuth
  const label = labels.find(l => isUndo ? l.name === labelId : l.id === labelId);

  if (!fileId || !label) {
    return { success: false, message: 'ID file atau label tidak valid.' };
  }

  const drive = getDriveClient();
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.ID_SPREADSHEET_LOG;

  try {
    if (isUndo) {
      console.log(`--- Proses Pembatalan Dimulai ---`);
      const targetFolderId = getFolderIdByLabel(label.name);

      await drive.files.update({
        fileId: fileId,
        addParents: originalParent,
        removeParents: targetFolderId,
        fields: 'id, parents',
      });
      console.log(`File ${fileId} dipindahkan dari folder '${label.name}' kembali ke 'ALL'.`);
      
      // Hapus log dari Google Sheet (implementasi sederhana: cari baris dan hapus)
      // Ini adalah implementasi yang lebih kompleks, untuk saat ini kita lewati penghapusan log
      console.log(`Log untuk file ${fileId} dengan label ${label.name} perlu dihapus secara manual atau dengan logika yang lebih canggih.`);
      
      revalidatePath('/dashboard');
      return { success: true, message: `Label untuk file telah diurungkan.` };

    } else {
      console.log(`--- Proses Pelabelan Dimulai ---`);
      
      const file = await drive.files.get({ fileId, fields: 'name, parents' });
      if (!file.data.parents) {
          throw new Error('File tidak memiliki folder induk.');
      }
      const currentParent = file.data.parents[0];
      const newName = `${fileId.substring(0, 5)}_${user}_${label.id}.wav`;
      const destinationFolderId = getFolderIdByLabel(label.name);

      if (!destinationFolderId) {
          return { success: false, message: `Folder tujuan untuk label '${label.name}' tidak ditemukan.` };
      }

      // 1. Ganti nama file
      await drive.files.update({
        fileId: fileId,
        requestBody: { name: newName },
      });
      console.log(`File diganti namanya menjadi: ${newName}`);

      // 2. Pindahkan file
      await drive.files.update({
        fileId: fileId,
        addParents: destinationFolderId,
        removeParents: currentParent,
        fields: 'id, parents',
      });
      console.log(`File dipindahkan ke folder: ${label.name}`);

      // 3. Catat ke Google Sheets
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[new Date().toISOString(), user, file.data.name, newName, label.name, fileId]],
        },
      });
      console.log('Transaksi dicatat di Google Sheet.');
      
      revalidatePath('/dashboard');
      return { success: true, message: `File diberi label sebagai ${label.name}.`, originalParent: currentParent };
    }
  } catch (error: any) {
    console.error('Proses gagal:', error.message);
    return { success: false, message: 'Gagal memproses file.' };
  }
}
