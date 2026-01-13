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

    // Deteksi tinggi responsif
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'hsl(var(--muted-foreground))',
      progressColor: 'hsl(var(--primary))',
      cursorColor: 'hsl(var(--primary))',
      barWidth: 2,
      barRadius: 3,
      barGap: 2, // PERBAIKAN: Gunakan barGap, bukan gap
      height: isMobile ? 80 : 100,
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
      const target = e.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;

      if (e.key === ' ' && !isTyping) {
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
    <div className="w-full space-y-4 p-1 md:p-0">
      <div className="relative bg-muted/10 rounded-lg px-2 pt-2">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Skeleton className="h-[80px] md:h-[100px] w-full" />
          </div>
        )}
        <div 
          ref={containerRef} 
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} 
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          <Button 
            onClick={handlePlayPause} 
            size="icon" 
            className="h-10 w-10 md:h-11 md:w-11 shrink-0"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-5 w-5 md:h-6 md:w-6" /> : <Play className="h-5 w-5 md:h-6 md:w-6" />}
          </Button>
          <Button 
            onClick={handleRestart} 
            size="icon" 
            variant="outline" 
            className="h-10 w-10 md:h-11 md:w-11 shrink-0"
            aria-label="Restart"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-xs md:text-sm font-mono text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/50 shadow-sm">
          <span className="text-foreground font-bold">{currentTime}</span>
          <span className="mx-1 text-muted-foreground/50">/</span>
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
};

export default WaveformPlayer;