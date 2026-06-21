import { Navbar1 } from '../navbar1';
import AnnouncementBanner from './announcement-banner';

export default function Header() {
  return (
    <header className="fixed top-0 z-50 w-full">
      <AnnouncementBanner />
      <Navbar1 />
    </header>
  );
}
