export function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return raw.replace('/rest/v1/', '');
}
