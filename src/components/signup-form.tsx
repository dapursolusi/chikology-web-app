'use client';

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

export function SignupForm({
  onSwitchToLogin,
  ...props
}: React.ComponentProps<typeof Card> & {
  onSwitchToLogin?: () => void;
}) {
  return (
    <Card {...props} className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Buat akun baru</CardTitle>
        <CardDescription>
          Daftar untuk mulai perjalanan kesehatan mental kamu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                className="h-11"
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
              />
              <FieldDescription className="text-xs">
                Minimal 8 karakter
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Konfirmasi Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                required
                className="h-11"
              />
              <FieldDescription>Konfirmasikan password kamu.</FieldDescription>
            </Field>
            <Field>
              <Button type="submit" className="w-full h-11 text-base">
                Buat Akun
              </Button>
              <Button variant="outline" type="button" className="w-full h-11">
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
