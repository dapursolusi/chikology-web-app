'use server';

import { revalidatePath } from 'next/cache';

import { getAdminRole } from '@/actions/book';
import { db } from '@/db';
import {
  bookChapters,
  chapterPurchases,
  paymentProofs,
  users,
} from '@/db/schema';
import { and, eq } from 'drizzle-orm';

import { createClient, createServiceClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function submitPaymentProof(
  formData: FormData
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const chapterId = formData.get('chapterId');
  if (!chapterId || typeof chapterId !== 'string') {
    return { error: 'ID bab diperlukan' };
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return { error: 'File bukti pembayaran diperlukan' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Format file harus JPEG, PNG, atau WebP' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'Ukuran file maksimal 5MB' };
  }

  const existing = await db
    .select({
      id: paymentProofs.id,
      status: paymentProofs.status,
      proofPath: paymentProofs.proofPath,
    })
    .from(paymentProofs)
    .where(
      and(
        eq(paymentProofs.userId, user.id),
        eq(paymentProofs.chapterId, chapterId)
      )
    );

  const activeProof = existing.find(
    (p) => p.status === 'pending' || p.status === 'approved'
  );
  if (activeProof) {
    return { error: 'Bukti pembayaran sudah dikirim dan menunggu verifikasi' };
  }

  const rejectedProof = existing.find((p) => p.status === 'rejected');
  if (rejectedProof?.proofPath) {
    await supabase.storage
      .from('payment-proofs')
      .remove([rejectedProof.proofPath]);
  }

  const ext = file.name.split('.').pop() ?? 'png';
  const timestamp = Date.now();
  const proofPath = `${user.id}/${chapterId}-${timestamp}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(proofPath, file, { contentType: file.type });

  if (uploadError) {
    return { error: 'Gagal mengupload bukti pembayaran' };
  }

  await db
    .insert(paymentProofs)
    .values({
      userId: user.id,
      chapterId,
      proofPath,
      status: 'pending',
    })
    .returning({ id: paymentProofs.id });

  return { success: true };
}

export async function getProofVerifications() {
  const role = await getAdminRole();
  if (role !== 'admin')
    return { error: 'Hanya admin yang dapat mengakses verifikasi pembayaran' };

  const rows = await db
    .select({
      id: paymentProofs.id,
      userId: paymentProofs.userId,
      chapterId: paymentProofs.chapterId,
      proofPath: paymentProofs.proofPath,
      status: paymentProofs.status,
      rejectionReason: paymentProofs.rejectionReason,
      createdAt: paymentProofs.createdAt,
      userEmail: users.email,
      chapterTitle: bookChapters.title,
      chapterNumber: bookChapters.chapterNumber,
    })
    .from(paymentProofs)
    .innerJoin(users, eq(paymentProofs.userId, users.id))
    .innerJoin(bookChapters, eq(paymentProofs.chapterId, bookChapters.id))
    .where(eq(paymentProofs.status, 'pending'));

  const serviceClient = createServiceClient();
  const bucket = serviceClient.storage.from('payment-proofs');

  return Promise.all(
    rows.map(async (row) => {
      const { data } = await bucket.createSignedUrl(row.proofPath, 86400);
      return { ...row, proofImageUrl: data?.signedUrl ?? null };
    })
  );
}

export async function verifyPaymentProof(
  proofId: string,
  action: 'approve' | 'reject',
  rejectionReason?: string
) {
  const role = await getAdminRole();
  if (role !== 'admin')
    return { error: 'Hanya admin yang dapat memverifikasi pembayaran' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (action === 'approve') {
    const [proof] = await db
      .select({
        userId: paymentProofs.userId,
        chapterId: paymentProofs.chapterId,
      })
      .from(paymentProofs)
      .where(eq(paymentProofs.id, proofId));

    if (!proof) return { error: 'Bukti pembayaran tidak ditemukan' };

    await db
      .insert(chapterPurchases)
      .values({ userId: proof.userId, chapterId: proof.chapterId })
      .returning({ id: chapterPurchases.id });

    await db
      .update(paymentProofs)
      .set({
        status: 'approved',
        reviewedBy: user?.id,
        reviewedAt: new Date(),
      })
      .where(eq(paymentProofs.id, proofId));
  } else if (action === 'reject') {
    await db
      .update(paymentProofs)
      .set({
        status: 'rejected',
        rejectionReason: rejectionReason ?? null,
        reviewedBy: user?.id,
        reviewedAt: new Date(),
      })
      .where(eq(paymentProofs.id, proofId));
  }

  revalidatePath('/dashboard/book');
  revalidatePath('/dashboard/admin/book');
  return { success: true };
}
