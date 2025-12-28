'use server';

import { revalidatePath } from 'next/cache';

// Ini adalah tindakan server tiruan. Dalam aplikasi nyata, ini akan
// berinteraksi dengan Google Drive dan Google Sheets API.
export async function labelFileAction(formData: FormData) {
  const fileId = formData.get('fileId');
  const label = formData.get('label');
  const user = 'Zaid'; // Ini akan datang dari sesi yang diautentikasi
  const isUndo = formData.get('undo') === 'true';

  if (!fileId || !label) {
    return { success: false, message: 'ID file atau label hilang.' };
  }

  try {
    if (isUndo) {
      // Logika untuk Mengurungkan
      console.log(`--- Proses Pembatalan Dimulai ---`);
      console.log(`User: ${user}`);
      console.log(`File ID: ${fileId}`);
      console.log(`Mengurungkan label: ${label}`);

      // 1. Simulasikan pemindahan file kembali ke folder 'SEMUA'
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log(`Langkah 1: Memindahkan file dari '${label}' kembali ke folder 'SEMUA'`);

      // 2. Simulasikan penghapusan log dari Google Sheets
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log(`Langkah 2: Menghapus log transaksi dari Google Sheet`);
      console.log(`--- Proses Pembatalan Selesai ---`);

      revalidatePath('/dashboard');
      return { success: true, message: `Label untuk ${fileId} telah diurungkan.` };

    } else {
      // Logika Pelabelan Normal
      console.log(`--- Proses Pelabelan Dimulai ---`);
      console.log(`User: ${user}`);
      console.log(`File ID: ${fileId}`);
      console.log(`Label: ${label}`);

      // 1. Simulasikan penggantian nama file
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log(`Langkah 1: Mengganti nama file menjadi 01_${user}_${label}.wav`);

      // 2. Simulasikan pemindahan file
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log(`Langkah 2: Memindahkan file dari 'SEMUA' ke folder '${label}'`);

      // 3. Simulasikan logging ke Google Sheets
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log(`Langkah 3: Mencatat transaksi ke Google Sheet`);
      console.log(`--- Proses Pelabelan Selesai ---`);

      revalidatePath('/dashboard');
      return { success: true, message: `File ${fileId} diberi label sebagai ${label}.` };
    }
  } catch (error) {
    console.error('Proses gagal:', error);
    return { success: false, message: 'Gagal memproses file.' };
  }
}
