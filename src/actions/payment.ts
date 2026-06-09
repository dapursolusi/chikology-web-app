'use server';

import { db } from '@/db';
import { paymentProofs } from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';

import { createClient } from '@/lib/supabase/server';

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
    .select({ id: paymentProofs.id, status: paymentProofs.status })
    .from(paymentProofs)
    .where(
      and(
        eq(paymentProofs.userId, user.id),
        eq(paymentProofs.chapterId, chapterId),
        inArray(paymentProofs.status, ['pending', 'approved'])
      )
    );

  if (existing.length > 0) {
    return { error: 'Bukti pembayaran sudah dikirim dan menunggu verifikasi' };
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
