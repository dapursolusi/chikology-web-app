'use server';

import { db } from '@/db';
import { paymentProofs } from '@/db/schema';
import { and, desc, eq } from 'drizzle-orm';

import { createServiceClient } from '@/lib/supabase/server';

export async function getRejectedProofUrl(
  chapterId: string
): Promise<{ url: string } | { error: string }> {
  const proofs = await db
    .select({
      proofPath: paymentProofs.proofPath,
    })
    .from(paymentProofs)
    .where(
      and(
        eq(paymentProofs.chapterId, chapterId),
        eq(paymentProofs.status, 'rejected')
      )
    )
    .orderBy(desc(paymentProofs.createdAt))
    .limit(1);

  const latestRejected = proofs[0];
  if (!latestRejected) return { error: 'Tidak ada bukti yang ditolak' };

  const serviceClient = createServiceClient();
  const { data } = await serviceClient.storage
    .from('payment-proofs')
    .createSignedUrl(latestRejected.proofPath, 86400);

  if (!data?.signedUrl) return { error: 'Gagal memuat bukti yang ditolak' };

  return { url: data.signedUrl };
}
