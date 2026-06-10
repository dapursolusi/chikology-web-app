'use client';

import { useState, useTransition } from 'react';

import { verifyPaymentProof } from '@/actions/payment';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface ProofVerification {
  id: string;
  userId: string;
  chapterId: string;
  proofPath: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  createdAt: Date;
  userEmail: string;
  chapterTitle: string;
  chapterNumber: number;
  proofImageUrl: string | null;
}

interface Props {
  proofs: ProofVerification[];
}

export function AdminVerificationPanel({ proofs }: Props) {
  if (proofs.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        Belum ada bukti pembayaran yang perlu diverifikasi.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Verifikasi Pembayaran
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pengguna</TableHead>
            <TableHead>Bab</TableHead>
            <TableHead>Tanggal Upload</TableHead>
            <TableHead>Bukti</TableHead>
            <TableHead className="w-56 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proofs.map((proof) => (
            <ProofRow key={proof.id} proof={proof} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ProofRow({ proof }: { proof: ProofVerification }) {
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);

  function handleApprove() {
    startTransition(async () => {
      const result = await verifyPaymentProof(proof.id, 'approve');
      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Pembayaran diverifikasi');
      }
    });
  }

  function handleReject() {
    if (!rejectReason.trim()) return;
    startTransition(async () => {
      const result = await verifyPaymentProof(proof.id, 'reject', rejectReason);
      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Bukti pembayaran ditolak');
        setRejectOpen(false);
        setRejectReason('');
      }
    });
  }

  const uploadDate = new Date(proof.createdAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <TableRow>
      <TableCell className="font-medium">{proof.userEmail}</TableCell>
      <TableCell>
        <span className="text-muted-foreground">Bab {proof.chapterNumber}</span>
        {' — '}
        {proof.chapterTitle}
      </TableCell>
      <TableCell>{uploadDate}</TableCell>
      <TableCell>
        {proof.proofImageUrl ? (
          <a
            href={proof.proofImageUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={proof.proofImageUrl}
              alt="Bukti pembayaran"
              className="h-12 w-20 rounded border object-cover"
            />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">Tidak tersedia</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isPending}
            onClick={() => setConfirmApproveOpen(true)}
          >
            Setujui
          </Button>
          <AlertDialog
            open={confirmApproveOpen}
            onOpenChange={setConfirmApproveOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Setujui Pembayaran?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini akan memberikan akses bab kepada pengguna dan
                  tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction disabled={isPending} onClick={handleApprove}>
                  Ya, Setujui
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {rejectOpen ? (
            <div className="flex flex-col gap-1">
              <textarea
                className="h-20 w-48 rounded border border-input bg-background p-2 text-xs resize-none"
                placeholder="Alasan penolakan..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                autoFocus
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isPending || !rejectReason.trim()}
                onClick={handleReject}
              >
                Kirim
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRejectOpen(false);
                  setRejectReason('');
                }}
              >
                Batal
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setRejectOpen(true)}
            >
              Tolak
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
