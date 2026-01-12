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

  // Inisialisasi Speech Recognition
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
    // VALIDASI WAJIB FEEDBACK (Frontend Side)
    if (!feedback || feedback.trim().length < 3) {
      toast({ 
        title: 'Feedback Wajib Diisi', 
        description: 'Mohon tuliskan catatan atau gunakan mic sebelum memilih label (minimal 3 karakter).', 
        variant: 'destructive' 
      });
      return;
    }

    const formData = new FormData();
    formData.append('fileId', fileId);
    formData.append('label', labelId);
    formData.append('feedback', feedback.trim()); // Mengirim feedback yang sudah bersih dari spasi berlebih

    startTransition(async () => {
      const result = await labelFileAction(formData);
      if (result.success) {
        toast({ title: 'Berhasil', description: result.message });
        setFeedback(''); // Reset text area setelah berhasil
        onLabelSuccess(fileId, labelId, '');
      } else {
        toast({ title: 'Gagal', description: result.message, variant: 'destructive' });
      }
    });
  };

  // Keyboard Shortcuts (Hanya jalan jika feedback sudah diisi)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Jangan jalankan jika sedang fokus di input/textarea
      if (document.querySelector('input:focus, textarea:focus')) return;

      const key = parseInt(event.key, 10);
      if (key >= 1 && key <= labels.length) {
        event.preventDefault();
        const label = labels[key - 1];
        
        if (label && !isPending) {
          handleLabelClick(label.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fileId, isPending, feedback]); // Tambahkan feedback ke dependency agar listener tahu status terbaru

  return (
    <div className="space-y-4">
      <div className="relative group">
        <Textarea
          placeholder="Tulis feedback/catatan atau gunakan tombol mic... (WAJIB)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className={`min-h-[100px] transition-all pr-12 border-2 ${
            !feedback.trim() ? 'border-amber-200 bg-amber-50/30' : 'bg-muted/30 focus:bg-background border-primary/20'
          }`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`absolute bottom-2 right-2 rounded-full ${
            isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-muted-foreground'
          }`}
          onClick={toggleListening}
          disabled={isPending}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {labels.map((label, index) => (
          <Button
            key={label.id}
            type="button"
            variant="outline"
            className={`h-14 text-base font-semibold relative border-2 transition-all ${
              feedback.trim().length >= 3 
                ? 'hover:border-primary/50 border-primary/10' 
                : 'opacity-50 cursor-not-allowed bg-muted/50'
            }`}
            onClick={() => handleLabelClick(label.id)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span className="absolute top-1 left-1.5 h-5 w-5 text-[10px] flex items-center justify-center rounded-full bg-muted text-muted-foreground border">
                  {index + 1}
                </span>
                {label.name}
              </>
            )}
          </Button>
        ))}
      </div>
      {!feedback.trim() && (
        <p className="text-xs text-amber-600 font-medium italic">
          * Isi feedback terlebih dahulu untuk mengaktifkan tombol label dan shortcut keyboard.
        </p>
      )}
    </div>
  );
}