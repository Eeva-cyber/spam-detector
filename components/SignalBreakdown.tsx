'use client';

import type { Signal } from '@/lib/types';

interface Props {
  signals: Signal[];
}

const signalColors: Record<string, string> = {
  'Urgency Language': 'bg-orange-50 text-orange-700 border-orange-100',
  'Promotional Bait': 'bg-blue-50 text-blue-700 border-blue-100',
  'Call-to-Action Phrase': 'bg-purple-50 text-purple-700 border-purple-100',
  'External Link': 'bg-red-50 text-red-700 border-red-100',
  'Excessive Punctuation': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'Aggressive Capitalization': 'bg-gray-50 text-gray-600 border-gray-200',
};

function getSignalColor(name: string): string {
  return signalColors[name] ?? 'bg-gray-50 text-gray-600 border-gray-200';
}

export default function SignalBreakdown({ signals }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="mb-4 text-sm font-semibold text-gray-700">Signal Breakdown</p>

      {signals.length === 0 ? (
        <p className="text-sm text-gray-400">No signals triggered.</p>
      ) : (
        <div className="space-y-3">
          {signals.map((signal, i) => (
            <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${getSignalColor(signal.name)}`}
                >
                  {signal.name}
                </span>
                <span className="shrink-0 text-sm font-bold text-red-500">+{signal.score}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">{signal.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
