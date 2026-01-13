'use client';

import React, { useTransition, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { labelFileAction } from '@/lib/actions';
import { labels } from '@/lib/data';
import { Loader2, Mic, MicOff } from 'lucide-react';

interface LabelingControlsProps {
  fileId: string;
  originalParent: string;
  onLabelSuccess: (fileId: string, label: string, originalParent: string) => void;
}

export default function LabelingControls({ fileId, originalParent, onLabelSuccess }: LabelingControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  // 1. RESET FEEDBACK SAAT AUDIO BERGANTI
  useEffect(() => {
    setFeedback('');
  }, [fileId]);

  // 2. INISIALISASI SPEECH RECOGNITION
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'speechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'id-ID';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setFeedback((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({ title: 'Tidak didukung', description: 'Browser Anda tidak mendukung fitur suara.', variant: 'destructive' });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleLabelClick = (labelId: string) => {
    if (!feedback || feedback.trim().length < 3) {
      toast({ 
        title: 'Feedback Wajib Diisi', 
        description: 'Mohon tuliskan catatan (min. 3 karakter) sebelum memilih label.', 
        variant: 'destructive' 
      });
      return;
    }

    const formData = new FormData();
    formData.append('fileId', fileId);
    formData.append('label', labelId);
    formData.append('feedback', feedback.trim());

    startTransition(async () => {
      const result = await labelFileAction(formData);
      if (result.success) {
        toast({ title: 'Berhasil', description: result.message });
        setFeedback(''); 
        onLabelSuccess(fileId, labelId, originalParent);
      } else {
        toast({ title: 'Gagal', description: result.message, variant: 'destructive' });
      }
    });
  };

  // 3. KEYBOARD SHORTCUTS HANDLER
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return; 
      }

      const key = parseInt(event.key, 10);
      if (!isNaN(key) && key >= 1 && key <= labels.length) {
        event.preventDefault();
        const label = labels[key - 1];
        if (label && !isPending) {
          handleLabelClick(label.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fileId, isPending, feedback, originalParent, onLabelSuccess]);

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* AREA TEXTAREA - RESPONSIVE HEIGHT */}
      <div className="relative group">
        <Textarea
          placeholder="Tulis feedback/catatan atau gunakan mic... (WAJIB)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === ' ') {
              e.stopPropagation();
            }
          }}
          className={`min-h-[120px] md:min-h-[100px] text-sm md:text-base transition-all pr-12 border-2 ${
            !feedback.trim() ? 'border-amber-200 bg-amber-50/30' : 'bg-muted/30 focus:bg-background border-primary/20'
          }`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`absolute bottom-2 right-2 rounded-full h-9 w-9 md:h-10 md:w-10 ${
            isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-muted-foreground'
          }`}
          onClick={toggleListening}
          disabled={isPending}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
      </div>

      {/* GRID TOMBOL LABEL - RESPONSIF (2 kolom mobile, 3 tablet, 5 desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {labels.map((label, index) => (
          <Button
            key={label.id}
            type="button"
            variant="outline"
            className={`h-14 md:h-16 text-sm md:text-base font-semibold relative border-2 transition-all ${
              feedback.trim().length >= 3 
                ? 'hover:border-primary/50 border-primary/10 hover:bg-primary/5 shadow-sm' 
                : 'opacity-50 cursor-not-allowed bg-muted/50 grayscale'
            }`}
            onClick={() => handleLabelClick(label.id)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-primary" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-0.5">
                {/* Indikator Shortcut - Sembunyikan di HP untuk hemat ruang */}
                <span className="hidden sm:flex absolute top-1 left-1.5 h-4 w-4 md:h-5 md:w-5 text-[9px] md:text-[10px] items-center justify-center rounded-full bg-muted text-muted-foreground border">
                  {index + 1}
                </span>
                <span className="truncate w-full px-1">{label.name}</span>
              </div>
            )}
          </Button>
        ))}
      </div>

      {/* HELPER TEXT - RESPONSIVE SIZE */}
      {!feedback.trim() && (
        <p className="text-[11px] md:text-xs text-amber-600 font-medium italic animate-in fade-in slide-in-from-top-1">
          * Isi feedback minimal 3 karakter untuk mengaktifkan tombol label.
        </p>
      )}
    </div>
  );
}