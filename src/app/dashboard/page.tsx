'use client';

import React, { useState, useEffect, useCallback } from 'react';
import WaveformPlayer from '@/components/dashboard/waveform-player';
import LabelingControls from '@/components/dashboard/labeling-controls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// PERBAIKAN: Loader2 ditambahkan ke import lucide-react
import { Info, ListMusic, CheckCircle, SkipForward, Undo, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
// PERBAIKAN: Import fetchFilesAction dari actions (Server Side), bukan google.ts
import { labelFileAction, fetchFilesAction } from '@/lib/actions';

type AudioFile = {
  id: string;
  name: string;
  url: string;
};

export default function DashboardPage() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [initialFileCount, setInitialFileCount] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [lastLabeled, setLastLabeled] = useState<{ fileId: string; label: string; originalParent: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // PERBAIKAN: Menggunakan fetchFilesAction yang memanggil Drive API di sisi server
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchFilesAction();
      if (result.success && result.data) {
        // PERBAIKAN: Map data dari Drive ke format AudioFile yang dibutuhkan frontend
        const mappedFiles = result.data.map((file: any) => ({
          id: file.id,
          name: file.name,
          // PERBAIKAN: URL diarahkan ke API streaming route yang kita buat sebelumnya
          url: `/api/audio/${file.id}`
        }));
        setAudioFiles(mappedFiles);
        setInitialFileCount(mappedFiles.length);
        setCurrentFileIndex(0);
      } else {
        throw new Error('Gagal mengambil data');
      }
    } catch (error) {
      toast({
        title: 'Gagal Memuat File',
        description: 'Tidak dapat mengambil file audio dari Google Drive.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const currentFile = audioFiles[currentFileIndex];
  
  // Logic perhitungan kemajuan yang lebih akurat
  const labeledCount = initialFileCount - audioFiles.length;

  const handleLabelSuccess = (fileId: string, label: string, originalParent: string) => {
    setLastLabeled({ fileId, label, originalParent });
    // Hapus file yang sudah dilabeli dari state lokal agar UI langsung update
    setAudioFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
    // Reset index ke 0 karena item pertama selalu yang terbaru setelah filter
    setCurrentFileIndex(0);
  };
  
  const handleSkipFile = () => {
    if (audioFiles.length > 1) {
      setCurrentFileIndex(prevIndex => (prevIndex + 1) % audioFiles.length);
    }
  };

  const handleUndo = async () => {
    if (!lastLabeled) {
      toast({ title: 'Tidak ada tindakan untuk diurungkan', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('undo', 'true');
    formData.append('fileId', lastLabeled.fileId);
    formData.append('label', lastLabeled.label);
    formData.append('originalParent', lastLabeled.originalParent);
    
    // PERBAIKAN: Menjalankan action undo
    const result = await labelFileAction(formData);

    if (result.success) {
      toast({ title: 'Berhasil diurungkan', description: result.message });
      fetchFiles(); // Refresh daftar dari Drive
      setLastLabeled(null);
    } else {
      toast({ title: 'Gagal mengurungkan', description: result.message, variant: 'destructive' });
    }
  };

  const resetQueue = () => {
    fetchFiles();
    setLastLabeled(null);
  };

  // State Loading UI
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
          <h3 className="text-2xl font-bold font-headline mb-2">Memuat Audio...</h3>
          <p className="text-muted-foreground">Mengambil file dari Google Drive.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Pelabelan Audio</CardTitle>
            </CardHeader>
            <CardContent>
              {currentFile ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      File Saat Ini: {currentFile.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Dengarkan audio dan pilih label yang sesuai di bawah ini.
                    </p>
                  </div>
                  {/* WaveformPlayer menerima URL API Stream */}
                  <WaveformPlayer audioUrl={currentFile.url} key={currentFile.id} />
                  <LabelingControls 
                    fileId={currentFile.id}
                    // ID Folder "ALL" diambil dari ENV untuk kebutuhan Undo
                    originalParent={process.env.NEXT_PUBLIC_ID_FOLDER_ALL || ''}
                    onLabelSuccess={handleLabelSuccess} 
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-2xl font-bold font-headline mb-2">Semua File Dilabeli!</h3>
                  <p className="text-muted-foreground mb-6">
                    Anda telah berhasil memberi label pada semua file audio yang tersedia.
                  </p>
                  <Button onClick={resetQueue}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Muat Ulang
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kemajuan Sesi Ini</CardTitle>
              <ListMusic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{labeledCount} / {initialFileCount}</div>
              <p className="text-xs text-muted-foreground">file berlabel</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Instruksi</CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>1. Tekan <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Spasi</span> untuk putar/jeda audio.</p>
              <p>2. Gunakan tombol angka <span className="font-mono bg-muted px-1.5 py-0.5 rounded">1-5</span> untuk pelabelan cepat.</p>
              <p>3. Kemajuan Anda disimpan secara otomatis.</p>
               <div className="flex gap-2 pt-2">
                 <Button variant="outline" size="sm" className="w-full" onClick={handleSkipFile} disabled={audioFiles.length <= 1}>
                    <SkipForward className="mr-2 h-4 w-4" />
                    Lewati
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={handleUndo} disabled={!lastLabeled}>
                    <Undo className="mr-2 h-4 w-4" />
                    Urungkan
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}