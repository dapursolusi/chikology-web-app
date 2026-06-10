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
import { cn } from '@/lib/utils';

export function LoginForm({
  className,
  onSwitchToSignup,
  ...props
}: React.ComponentProps<'div'> & {
  onSwitchToSignup?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
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
    <div className={cn('flex flex-col', className)} {...props}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            Selamat datang kembali
          </CardTitle>
          <CardDescription>
            Masuk dengan Google untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            variant="outline"
            className="w-full h-11"
            disabled={loading}
            onClick={handleGoogleLogin}
          >
            {loading ? 'Memproses...' : 'Masuk dengan Google'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-primary underline-offset-4 hover:underline"
            >
              Buat akun baru
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
