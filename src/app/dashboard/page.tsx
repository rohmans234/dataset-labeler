'use client';

import React, { useState, useTransition, use, Suspense, useEffect, useMemo } from 'react';
import WaveformPlayer from '@/components/dashboard/waveform-player';
import LabelingControls from '@/components/dashboard/labeling-controls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { audioFiles } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Info, ListMusic, CheckCircle, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [labeledFiles, setLabeledFiles] = useState<string[]>([]);

  const currentFile = useMemo(() => {
    const nextIndex = audioFiles.findIndex(file => !labeledFiles.includes(file.id));
    return nextIndex !== -1 ? audioFiles[nextIndex] : null;
  }, [labeledFiles]);

  const handleNextFile = () => {
    if (currentFile) {
      setLabeledFiles(prev => [...prev, currentFile.id]);
    }
  };
  
  const handleSkipFile = () => {
    if (currentFile) {
        // Find current file's actual index in the main array
        const currentIndexInAudioFiles = audioFiles.findIndex(f => f.id === currentFile.id);
        if (currentIndexInAudioFiles < audioFiles.length - 1) {
            // "Skip" by pretending it's labeled to move to the next one
            setLabeledFiles(prev => [...prev, currentFile.id]);
        } else {
            // Last file, reset
            setLabeledFiles([]);
        }
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Audio Labeling</CardTitle>
            </CardHeader>
            <CardContent>
              {currentFile ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Current File: {currentFile.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Listen to the audio and select the appropriate label below.
                    </p>
                  </div>
                  <Suspense fallback={<Skeleton className="h-[128px] w-full" />}>
                     <WaveformPlayer audioUrl={currentFile.url} key={currentFile.id} />
                  </Suspense>
                  <LabelingControls fileId={currentFile.id} onLabelSuccess={handleNextFile} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-2xl font-bold font-headline mb-2">All Files Labeled!</h3>
                  <p className="text-muted-foreground mb-6">
                    You have successfully labeled all available audio files.
                  </p>
                  <Button onClick={() => setLabeledFiles([])}>Start Over</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <ListMusic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{labeledFiles.length} / {audioFiles.length}</div>
              <p className="text-xs text-muted-foreground">files labeled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Instructions</CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>1. Press <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Space</span> to play/pause audio.</p>
              <p>2. Use number keys <span className="font-mono bg-muted px-1.5 py-0.5 rounded">1-5</span> for quick labeling.</p>
              <p>3. Your progress is saved automatically.</p>
               <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleSkipFile} disabled={!currentFile}>
                <SkipForward className="mr-2 h-4 w-4" />
                Skip File
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
