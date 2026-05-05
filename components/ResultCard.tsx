'use client';

import type { SpamResult } from '@/lib/types';

type Verdict = SpamResult['verdict'];

const verdictConfig: Record<Verdict, {
  label: string; subtitle: string;
  bg: string; border: string; text: string; dot: string;
}> = {
  SAFE: {
    label: 'SAFE',
    subtitle: 'No phishing indicators detected',
    bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', dot: 'bg-green-500',
  },
  SUSPICIOUS: {
    label: 'SUSPICIOUS',
    subtitle: 'Some suspicious patterns found',
    bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500',
  },
  PHISHING: {
    label: 'PHISHING',
    subtitle: 'High confidence — likely a phishing attempt',
    bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', dot: 'bg-red-500',
  },
};

interface Props { result: SpamResult }

export default function ResultCard({ result }: Props) {
  const { verdict, riskScore, confidence, reasoning } = result;
  const cfg = verdictConfig[verdict];

  return (
    <div className="space-y-3">
      <div className={`rounded-xl border p-6 ${cfg.bg} ${cfg.border}`}>
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
          <span className={`text-3xl font-bold tracking-tight ${cfg.text}`}>{cfg.label}</span>
        </div>
        <p className={`mt-1 text-sm ${cfg.text} opacity-70`}>{cfg.subtitle}</p>

        <div className={`mt-5 flex gap-8 border-t ${cfg.border} pt-4`}>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{riskScore}</p>
            <p className="mt-0.5 text-xs text-gray-500">Risk score (0–100)</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{confidence}%</p>
            <p className="mt-0.5 text-xs text-gray-500">Confidence</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{result.threatType}</p>
            <p className="mt-0.5 text-xs text-gray-500">Threat type</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Why this result?</h3>
        <ul className="space-y-2.5">
          {reasoning.map((point, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-gray-700">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
