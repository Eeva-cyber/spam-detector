'use client';

import type { Signal } from '@/lib/types';

interface Props {
  signals: Signal[];
}

export default function SignalBreakdown({ signals }: Props) {
  if (signals.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">Signals detected</h3>
      <div className="divide-y divide-gray-100">
        {signals.map((signal, i) => (
          <div key={i} className="flex items-start justify-between gap-4 py-2.5">
            <div className="min-w-0">
              <p className="text-sm text-gray-800">{signal.name}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{signal.explanation}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-red-500">+{signal.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
