'use client';

import { type StressTier, stressLevels } from '@/data/stressLevels';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface ScanResultAccordionProps {
  tier: StressTier;
}

export function ScanResultAccordion({ tier }: ScanResultAccordionProps) {
  const level = stressLevels[tier];

  return (
    <Accordion type="single" collapsible defaultValue="">
      <AccordionItem value="scan-result">
        <AccordionTrigger className="px-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{level.emoji}</span>
            <div className="flex flex-col items-start gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-medium">{level.label}</span>
                <Badge variant="outline" className="text-xs">
                  Tier {tier}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Hasil deteksi wajah
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 px-4 pb-4">
            <div>
              <p className="mb-2 text-sm font-medium">Pesan:</p>
              <p className="text-sm text-muted-foreground">{level.messages}</p>
            </div>

            {level.interventions.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">Intervensi:</p>
                <ul className="space-y-2">
                  {level.interventions.map((intervention, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                      <div>
                        <span className="font-medium">
                          {intervention.title}
                        </span>
                        {intervention.subTitle && (
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            ({intervention.subTitle})
                          </span>
                        )}
                        <p className="text-muted-foreground">
                          {intervention.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
