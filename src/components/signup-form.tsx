'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { createClient } from '@/lib/supabase/client';

export function SignupForm({
  onSwitchToLogin,
  ...props
}: React.ComponentProps<typeof Card> & {
  onSwitchToLogin?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <Card {...props} className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Buat akun baru</CardTitle>
        <CardDescription>Daftar dengan Google untuk memulai</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          variant="outline"
          className="w-full h-11"
          disabled={loading}
          onClick={handleGoogleSignup}
        >
          {loading ? 'Memproses...' : 'Daftar dengan Google'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary underline-offset-4 hover:underline"
          >
            Masuk
          </button>
        </p>
      </CardContent>
    </Card>
  );
}
