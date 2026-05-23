import EBook from '@/components/sections/home/e-book';
import Features from '@/components/sections/home/features';
import { Hero } from '@/components/sections/home/hero';

export default function MainPage() {
  return (
    <div className="flex flex-col gap-8 min-h-screen">
      <Hero />
      <EBook />
      <Features />
    </div>
  );
}
