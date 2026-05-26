import FaceScanner from '@/components/FaceScanner';

export default function ScannerPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 pt-0 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Face Scanner
        </h1>
        <p className="text-muted-foreground">
          Deteksi ekspresi wajahmu dan dapatkan rekomendasi untuk menjaga
          kesehatan mental.
        </p>
      </div>
      <FaceScanner />
    </div>
  );
}
