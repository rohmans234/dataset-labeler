// src/app/api/audio/[fileId]/route.ts
import { drive } from '@/lib/google';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  // Tipe params sekarang dibungkus dalam Promise
  { params }: { params: Promise<{ fileId: string }> }
) {
  // PERBAIKAN: Await params sebelum mengambil fileId
  const { fileId } = await params;

  try {
    // Mengambil file dari Google Drive sebagai stream
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    // Kirim stream tersebut ke frontend
    return new NextResponse(response.data as any, {
      headers: {
        'Content-Type': 'audio/wav', // Pastikan sesuai format file kamu (audio/mpeg untuk mp3)
        'Content-Disposition': `inline; filename="${fileId}"`,
      },
    });
  } catch (error) {
    console.error('Streaming error:', error);
    return NextResponse.json({ error: 'Gagal memuat audio' }, { status: 500 });
  }
}