import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="text-lg font-semibold tracking-tighter">Chikology</span>
    </Link>
  );
}
