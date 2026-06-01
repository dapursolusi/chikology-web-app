import { describe, expect, it } from 'vitest';

const DASHBOARD_PREFIX = '/dashboard';
const dashboardLink = (path: string = '') =>
  path ? `${DASHBOARD_PREFIX}/${path}` : DASHBOARD_PREFIX;

const navMain = [
  {
    title: 'Jurnal Pribadi',
    url: '#',
    items: [
      {
        title: 'Isi Jurnal',
        url: dashboardLink('journal'),
      },
    ],
  },
  {
    title: 'Stress Detection',
    url: '#',
    items: [
      {
        title: 'Deteksi Wajah',
        url: dashboardLink('scanner'),
      },
    ],
  },
  {
    title: 'E-Book',
    url: '#',
    items: [
      {
        title: 'Baca E-Book',
        url: '#',
      },
    ],
  },
];

describe('Sidebar navMain', () => {
  it('Isi Jurnal links to /dashboard/journal', () => {
    const jurnal = navMain.find((n) => n.title === 'Jurnal Pribadi');
    expect(jurnal?.items[0].url).toBe('/dashboard/journal');
  });

  it('Deteksi Wajah links to /dashboard/scanner', () => {
    const scanner = navMain.find((n) => n.title === 'Stress Detection');
    expect(scanner?.items[0].url).toBe('/dashboard/scanner');
  });

  it('Baca E-Book links to # (Phase 3 placeholder)', () => {
    const ebook = navMain.find((n) => n.title === 'E-Book');
    expect(ebook?.items[0].url).toBe('#');
  });

  it('only Stress Detection sub-item links to /dashboard/scanner', () => {
    const scannerLinks = navMain.flatMap((item) =>
      item.items.filter((i) => i.url === '/dashboard/scanner')
    );
    expect(scannerLinks.length).toBe(1);
    expect(scannerLinks[0].title).toBe('Deteksi Wajah');
  });

  it('no nav items link to /dashboard/scanner except Deteksi Wajah', () => {
    const links = navMain.flatMap((item) => item.items.map((i) => i.url));
    const scannerLinks = links.filter((url) => url === '/dashboard/scanner');
    expect(scannerLinks).toEqual(['/dashboard/scanner']);
  });
});
