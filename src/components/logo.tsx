import Link from 'next/link';

export default function Logo() {
  const logo = {
    url: '/',
    src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg',
    alt: 'logo',
    title: 'Chikology',
  };

  return (
    <Link href={logo.url} className="flex items-center gap-2">
      <img src={logo.src} className="max-h-8 dark:invert" alt={logo.alt} />
      <span className="text-lg font-semibold tracking-tighter">
        {logo.title}
      </span>
    </Link>
  );
}
