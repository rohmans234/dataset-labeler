import { getDriveClient } from '@/lib/google';
import { NextResponse } from 'next/server';
import type { GaxiosResponse } from 'gaxios';
import type { Readable } from 'stream';

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  const { fileId } = params;

  if (!fileId) {
    return new NextResponse('File ID is required', { status: 400 });
  }

  try {
    const drive = getDriveClient();

    const fileResponse: GaxiosResponse<Readable> = await drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream' }
    );
    
    const stream = fileResponse.data;

    // Set header untuk streaming audio
    const headers = new Headers();
    headers.set('Content-Type', 'audio/wav'); // Asumsikan .wav, bisa dibuat dinamis
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'no-cache');

    // Menggunakan ReadableStream untuk mengirimkan data ke klien
    const readableStream = new ReadableStream({
        start(controller) {
            stream.on('data', (chunk: Buffer) => {
                controller.enqueue(chunk);
            });
            stream.on('end', () => {
                controller.close();
            });
            stream.on('error', (err) => {
                controller.error(err);
            });
        }
    });

    return new Response(readableStream, { headers });

  } catch (error: any) {
    console.error(`Gagal melakukan streaming file ${fileId}:`, error);
    return new NextResponse(
      JSON.stringify({ message: `Error streaming file: ${error.message}` }),
      { status: 500 }
    );
  }
}
