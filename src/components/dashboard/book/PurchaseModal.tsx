'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

import { purchaseChapter } from '@/actions/chapters';
import { submitPaymentProof } from '@/actions/payment';
import { getRejectedProofUrl } from '@/actions/proof';
import { ImageUp, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { ChapterWithState } from '@/lib/chapters';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter: ChapterWithState | null;
  onSuccess?: (chapter: ChapterWithState) => void;
};

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function PurchaseModal({
  open,
  onOpenChange,
  chapter,
  onSuccess,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(() =>
    chapter?.proofStatus === 'rejected' ? 2 : 1
  );
  const [rejectedProofUrl, setRejectedProofUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRejected = chapter?.proofStatus === 'rejected';

  useEffect(() => {
    if (chapter?.proofStatus === 'rejected' && chapter?.id) {
      getRejectedProofUrl(chapter.id).then((result) => {
        if ('url' in result) setRejectedProofUrl(result.url);
      });
    }
  }, [chapter?.id, chapter?.proofStatus]);

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      setStep(chapter?.proofStatus === 'rejected' ? 2 : 1);
      setError(null);
      setSelectedFile(null);
      setPreview(null);
      setRejectedProofUrl(null);
    }
    onOpenChange(newOpen);
  }

  if (!chapter) return null;

  const isFree = chapter.isFree;
  const priceLabel = isFree ? 'Gratis' : idrFormatter.format(chapter.priceIdr);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Format file harus JPEG, PNG, atau WebP');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleStep1Confirm() {
    if (!chapter) return;
    if (isFree) {
      setError(null);
      startTransition(async () => {
        const result = await purchaseChapter(chapter.id);
        if ('chapter' in result) {
          onOpenChange(false);
          onSuccess?.(chapter);
        } else {
          setError(result.error);
        }
      });
    } else {
      setStep(2);
    }
  }

  function handleSubmitPaymentProof() {
    if (!chapter) return;
    setError(null);

    startTransition(async () => {
      if (!selectedFile) {
        setError('Pilih file bukti pembayaran terlebih dahulu');
        return;
      }
      const formData = new FormData();
      formData.append('chapterId', chapter.id);
      formData.append('file', selectedFile);
      const result = await submitPaymentProof(formData);
      if ('error' in result) {
        setError(result.error);
      } else {
        onOpenChange(false);
        onSuccess?.(chapter);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{chapter.title}</DialogTitle>
          <DialogDescription>
            Bab {chapter.chapterNumber} · {priceLabel}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <>
            {isFree ? (
              <p className="text-sm text-muted-foreground">
                Bab ini gratis. Klik tombol di bawah untuk mulai membaca.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Klik Lanjutkan untuk mengupload bukti pembayaran.
              </p>
            )}

            {error && (
              <p
                data-testid="purchase-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleStep1Confirm}
                disabled={isPending}
              >
                {isPending && <Loader2 className="animate-spin" />}
                {isFree ? 'Ya, Klaim Gratis' : 'Lanjutkan'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <div className="space-y-3">
            {isRejected && rejectedProofUrl && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-destructive">
                  Bukti sebelumnya ditolak:
                </p>
                <img
                  src={rejectedProofUrl}
                  alt="Bukti pembayaran sebelumnya"
                  data-testid="rejected-proof-image"
                  className="max-h-32 rounded-lg object-contain border"
                />
              </div>
            )}

            {isRejected && chapter.rejectionReason && (
              <p
                className="text-xs text-destructive"
                data-testid="rejection-reason"
              >
                Alasan: {chapter.rejectionReason}
              </p>
            )}

            <label
              htmlFor="payment-proof"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview bukti pembayaran"
                  className="max-h-40 rounded-lg object-contain"
                />
              ) : (
                <>
                  <ImageUp className="size-8" />
                  <span>
                    {isRejected
                      ? 'Klik untuk upload bukti baru'
                      : 'Klik untuk upload bukti transfer'}
                    <br />
                    <span className="text-xs">JPEG, PNG, WebP · maks 5MB</span>
                  </span>
                </>
              )}
              <input
                ref={fileInputRef}
                id="payment-proof"
                data-testid="payment-proof-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {error && (
              <p
                data-testid="purchase-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isRejected) {
                    onOpenChange(false);
                  } else {
                    setStep(1);
                  }
                }}
                disabled={isPending}
              >
                {isRejected ? 'Batal' : 'Kembali'}
              </Button>
              <Button
                type="button"
                onClick={handleSubmitPaymentProof}
                disabled={isPending || !selectedFile}
              >
                {isPending && <Loader2 className="animate-spin" />}
                {isRejected ? 'Kirim Ulang' : 'Kirim'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
