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

import { cn } from '@/lib/utils';

export function LoginForm({
  className,
  onSwitchToSignup,
  ...props
}: React.ComponentProps<'div'> & {
  onSwitchToSignup?: () => void;
}) {
  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            Selamat datang kembali
          </CardTitle>
          <CardDescription>
            Masukkan akun kamu untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@contoh.com"
                  required
                  className="h-11"
                />
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Lupa password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="h-11"
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/dashboard';
                  }}
                >
                  Masuk
                </Button>
                <Button variant="outline" type="button" className="w-full h-11">
                  Masuk dengan Google
                </Button>
                <FieldDescription className="text-center pt-2">
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Buat akun baru
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
