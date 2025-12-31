import { google } from 'googleapis';

export const getGoogleAuth = () => {
  // Mengambil kredensial dari .env yang baru saja kamu buat
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });
  return auth;
};

export const drive = google.drive({ version: 'v3', auth: getGoogleAuth() });
export const sheets = google.sheets({ version: 'v4', auth: getGoogleAuth() });
export async function getUnlabeledFiles() {
  const response = await drive.files.list({
    q: `'${process.env.ID_FOLDER_ALL}' in parents and trashed = false`,
    fields: 'files(id, name)',
  });
  return response.data.files || [];
}