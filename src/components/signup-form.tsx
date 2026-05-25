'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

export function SignupForm({
  onSwitchToLogin,
  ...props
}: React.ComponentProps<typeof Card> & {
  onSwitchToLogin?: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.refresh();
    router.push('/dashboard');
  };

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
        <CardDescription>
          Daftar untuk mulai perjalanan kesehatan mental kamu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleEmailSignup}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                className="h-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="nama@contoh.com"
                required
                className="h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FieldDescription className="text-xs">
                Kami hanya menggunakan email ini untuk komunikasi penting.
                Privasi kamu dilindungi.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                className="h-11"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FieldDescription className="text-xs">
                Minimal 8 karakter
              </FieldDescription>
            </Field>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Field>
              <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Buat Akun'}
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full h-11"
                disabled={loading}
                onClick={handleGoogleSignup}
              >
                Daftar dengan Google
              </Button>
              <FieldDescription className="text-center pt-2 text-sm">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Masuk
                </button>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
