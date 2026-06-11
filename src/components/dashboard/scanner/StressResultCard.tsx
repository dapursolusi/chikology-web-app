'use client';

import Link from 'next/link';

import { StressLevel } from '@/data/stressLevels';

import { Button } from '@/components/ui/button';

export type AnalysisResult = StressLevel;

interface StressResultCardProps {
  result: AnalysisResult;
  onSave?: () => void;
  onReset?: () => void;
  isSaving?: boolean;
}

const tierGradients: Record<number, string> = {
  1: 'from-[#22c55e]/10 to-[#22c55e]/5',
  2: 'from-[#84cc16]/10 to-[#84cc16]/5',
  3: 'from-[#eab308]/10 to-[#eab308]/5',
  4: 'from-[#ef4444]/10 to-[#ef4444]/5',
  5: 'from-[#b91c1c]/15 to-[#b91c1c]/5',
};

const tierBorders: Record<number, string> = {
  1: 'border-l-[#22c55e]',
  2: 'border-l-[#84cc16]',
  3: 'border-l-[#eab308]',
  4: 'border-l-[#ef4444]',
  5: 'border-l-[#b91c1c]',
};

export function StressResultCard({
  result,
  onSave,
  onReset,
  isSaving,
}: StressResultCardProps) {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="overflow-hidden rounded-xl border">
        <div
          className="h-1 w-full rounded-full"
          style={{ backgroundColor: result.color }}
        />
        <div
          className={`space-y-4 bg-gradient-to-br p-5 ${tierGradients[result.tier]} border-l-4 ${tierBorders[result.tier]}`}
        >
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/90 text-2xl shadow-sm ring-1 ring-black/5">
              {result.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold">Tingkat {result.tier}</p>
              <p
                className="text-sm font-medium"
                style={{ color: result.color }}
              >
                {result.label}
              </p>
            </div>
          </div>

          <details className="group space-y-2 rounded-lg bg-white p-4 shadow-sm">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground group-open:text-primary">
              Lihat Detail
            </summary>
            <div className="mt-2 space-y-2 text-sm">
              <div>
                <p className="font-medium text-foreground">Ciri:</p>
                <ul className="text-foreground/70">
                  {result.signs.map((sign, index) => (
                    <li key={index}>{sign}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground">Risiko:</p>
                <ul className="text-foreground/70">
                  {result.risks.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          </details>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Intervensi
            </p>
            <ol className="text-sm">
              {result.interventions.map((intervention, index) => (
                <li key={index}>
                  <div className="space-y-1 rounded-md bg-primary/5 p-3">
                    <p>{intervention.title}</p>
                    <p className="text-foreground/70">
                      {intervention.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pesan dari Chikology
            </h4>
            <p className="text-sm leading-relaxed text-foreground/80">
              {result.messages[0]}
            </p>
          </div>

          <Link
            href="https://wa.me/6287853186759"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="secondary" className="w-full" size="lg">
              Konsultasi dengan Mas Chiko
            </Button>
          </Link>

          <div className="flex gap-2">
            {onSave && (
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="md:flex-1"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan ke Jurnal'}
              </Button>
            )}
            {onReset && (
              <Button onClick={onReset} variant="outline" className="md:flex-1">
                Analisis Ulang
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Datamu aman, privasi terjamin
          </p>
        </div>
      </div>
    </div>
  );
}
