'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WaveformPlayerProps {
  audioUrl: string;
}

const WaveformPlayer: React.FC<WaveformPlayerProps> = ({ audioUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!containerRef.current) return;
    setIsLoading(true);

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'hsl(var(--muted-foreground))',
      progressColor: 'hsl(var(--primary))',
      cursorColor: 'hsl(var(--primary))',
      barWidth: 3,
      barRadius: 3,
      responsive: true,
      height: 100,
      normalize: true,
      url: audioUrl,
    });

    waveSurferRef.current = ws;

    ws.on('ready', () => {
      setIsLoading(false);
      setDuration(formatTime(ws.getDuration()));
    });
    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('audioprocess', (time) => setCurrentTime(formatTime(time)));
    ws.on('finish', () => setIsPlaying(false));

    const handleSpacebar = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        ws.playPause();
      }
    };

    window.addEventListener('keydown', handleSpacebar);

    return () => {
      ws.destroy();
      window.removeEventListener('keydown', handleSpacebar);
    };
  }, [audioUrl]);

  const handlePlayPause = useCallback(() => {
    waveSurferRef.current?.playPause();
  }, []);

  const handleRestart = useCallback(() => {
    waveSurferRef.current?.seekTo(0);
  }, []);

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-[100px] w-full" />
          </div>
        )}
        <div ref={containerRef} className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'} />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={handlePlayPause} size="icon" aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button onClick={handleRestart} size="icon" variant="outline" aria-label="Restart">
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-sm font-mono text-muted-foreground">
          {currentTime} / {duration}
        </div>
      </div>
    </div>
  );
};

export default WaveformPlayer;
