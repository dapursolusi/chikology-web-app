'use client';

import { useSyncExternalStore } from 'react';

import Link from 'next/link';

const WA_LINK = 'https://wa.me/6287853186759';
const COOKIE_NAME = 'announcement_dismissed';
const DISMISS_DURATION_MS = 30 * 60 * 1000;

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}`;
}

let dismissed =
  typeof document !== 'undefined' && getCookie(COOKIE_NAME) !== null;

function subscribe(callback: () => void) {
  window.addEventListener('announcement-dismissed', callback);
  return () => window.removeEventListener('announcement-dismissed', callback);
}

function getSnapshot() {
  return dismissed;
}

function getServerSnapshot() {
  return true;
}

export default function AnnouncementBanner() {
  const isDismissed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (isDismissed) return null;

  const handleDismiss = () => {
    dismissed = true;
    window.dispatchEvent(new Event('announcement-dismissed'));
    setCookie(COOKIE_NAME, '1', DISMISS_DURATION_MS / 1000);
  };

  return (
    <div
      role="banner"
      className="sticky top-0 flex items-center justify-between w-full gap-3 bg-primary-700 px-4 py-1.5 text-primary-50 sm:py-2"
    >
      <p className="text-xs leading-snug sm:text-sm">
        Ingin curhat, konsultasi, atau dapat rekomendasi lebih dalam?{' '}
        <Link
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-white underline underline-offset-2 hover:text-primary-100"
        >
          Jadwalkan konsultasi dengan Mas Chiko
        </Link>
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Tutup pengumuman"
        className="shrink-0 rounded-md p-1 text-primary-200 transition-colors hover:bg-primary-600 hover:text-white"
      >
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
