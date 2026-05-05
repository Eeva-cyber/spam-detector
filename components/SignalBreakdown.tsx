'use client';

import type { Signal, SignalLayer } from '@/lib/types';

const layerBadge: Record<SignalLayer, { label: string; color: string }> = {
  headers: { label: 'Headers', color: 'bg-purple-100 text-purple-700' },
  sender:  { label: 'Sender',  color: 'bg-blue-100 text-blue-700'   },
  links:   { label: 'Links',   color: 'bg-orange-100 text-orange-700' },
  content: { label: 'Content', color: 'bg-gray-100 text-gray-600'   },
};

interface Props { signals: Signal[] }

export default function SignalBreakdown({ signals }: Props) {
  if (signals.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">Signals detected</h3>
      <div className="divide-y divide-gray-100">
        {signals.map((signal, i) => {
          const badge = layerBadge[signal.layer];
          return (
            <div key={i} className="flex items-start justify-between gap-4 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm text-gray-800">{signal.name}</p>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{signal.explanation}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-red-500">+{signal.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
