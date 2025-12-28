'use client';

import React, { useTransition, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { labelFileAction } from '@/lib/actions';
import { labels } from '@/lib/data';
import { Loader2 } from 'lucide-react';

interface LabelingControlsProps {
  fileId: string;
  onLabelSuccess: () => void;
}

export default function LabelingControls({ fileId, onLabelSuccess }: LabelingControlsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const handleLabelClick = (label: string) => {
    const formData = new FormData();
    formData.append('fileId', fileId);
    formData.append('label', label);

    startTransition(async () => {
      const result = await labelFileAction(formData);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
          variant: 'default',
        });
        onLabelSuccess();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = parseInt(event.key, 10);
      if (key >= 1 && key <= labels.length) {
        event.preventDefault();
        const label = labels[key - 1];
        if (label) {
          handleLabelClick(label.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fileId]);

  return (
    <form ref={formRef}>
      <input type="hidden" name="fileId" value={fileId} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {labels.map((label, index) => (
          <Button
            key={label.id}
            type="button"
            variant="outline"
            className="h-12 text-base font-semibold relative"
            onClick={() => handleLabelClick(label.id)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <span
                  className={`absolute top-1 left-1.5 h-5 w-5 text-xs flex items-center justify-center rounded-full bg-muted text-muted-foreground`}
                >
                  {index + 1}
                </span>
                {label.name}
              </>
            )}
          </Button>
        ))}
      </div>
    </form>
  );
}
