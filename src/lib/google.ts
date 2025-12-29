'use server';

import { google } from 'googleapis';

export const getGoogleAuth = () => {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });
};

export const getDriveClient = () => {
  const auth = getGoogleAuth();
  return google.drive({ version: 'v3', auth });
};

export const getSheetsClient = () => {
  const auth = getGoogleAuth();
  return google.sheets({ version: 'v4', auth });
};

export async function getAudioFiles() {
  try {
    const drive = getDriveClient();
    const res = await drive.files.list({
      q: `'${process.env.ID_FOLDER_ALL}' in parents and trashed = false and mimeType contains 'audio/'`,
      fields: 'files(id, name)',
      pageSize: 100, // Ambil hingga 100 file
    });
    
    if (!res.data.files) {
        return [];
    }

    return res.data.files.map(file => ({
        id: file.id || 'unknown-id',
        name: file.name || 'untitled',
        url: `/api/audio/${file.id}` // URL akan menunjuk ke API streaming kita
      }));

  } catch (error) {
    console.error('Gagal mengambil file dari Google Drive:', error);
    return [];
  }
}
