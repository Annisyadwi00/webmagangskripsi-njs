import { google } from 'googleapis';
import { Readable } from 'stream';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testUpload() {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  console.log('Testing Drive upload with credentials:', {
    clientId: clientId?.substring(0, 10) + '...',
    clientSecret: clientSecret?.substring(0, 5) + '...',
    refreshToken: refreshToken?.substring(0, 10) + '...',
    folderId,
  });

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const buffer = Buffer.from('Hello world test file');
    const stream = Readable.from(buffer);

    const response = await drive.files.create({
      requestBody: {
        name: 'test_upload.txt',
        parents: [folderId!],
      },
      media: {
        mimeType: 'text/plain',
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    console.log('Upload successful!', response.data);

    // Set permission
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    console.log('Permission set!');
  } catch (err: any) {
    console.error('Upload failed!');
    console.error(err.message);
    if (err.response?.data) {
      console.error(err.response.data);
    }
  }
}

testUpload();
