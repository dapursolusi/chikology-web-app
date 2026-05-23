import Link from 'next/link';

export default function LogoIcon() {
  const logo = {
    url: '/',
    src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg',
    alt: 'logo',
  };

  return (
    <Link href={logo.url} className="flex items-center gap-2">
      <img src={logo.src} className="max-h-8 dark:invert" alt={logo.alt} />
    </Link>
  );
}
