'use client';

import type { SpamResult } from '@/lib/types';

type Classification = SpamResult['classification'];

const verdictConfig: Record<
  Classification,
  { label: string; subtitle: string; bg: string; border: string; text: string; dot: string }
> = {
  Safe: {
    label: 'SAFE',
    subtitle: 'No risk detected',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
  'Likely Spam': {
    label: 'SUSPICIOUS',
    subtitle: 'Some suspicious patterns found',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  Spam: {
    label: 'SPAM',
    subtitle: 'High risk — likely spam',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
};

interface Props {
  result: SpamResult;
}

export default function ResultCard({ result }: Props) {
  const { classification, riskScore, confidence, reasoning } = result;
  const config = verdictConfig[classification];

  return (
    <div className="space-y-3">
      {/* Verdict hero */}
      <div className={`rounded-xl border p-6 ${config.bg} ${config.border}`}>
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
          <span className={`text-3xl font-bold tracking-tight ${config.text}`}>
            {config.label}
          </span>
        </div>
        <p className={`mt-1 text-sm ${config.text} opacity-70`}>{config.subtitle}</p>

        <div className={`mt-5 flex gap-8 border-t ${config.border} pt-4`}>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{riskScore}</p>
            <p className="mt-0.5 text-xs text-gray-500">Risk score (0–100)</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{confidence}%</p>
            <p className="mt-0.5 text-xs text-gray-500">Spam probability</p>
          </div>
        </div>
      </div>

      {/* Reasoning */}
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
