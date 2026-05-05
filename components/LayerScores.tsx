'use client';

import type { LayerScores } from '@/lib/types';

const layers: Array<{ key: keyof LayerScores; label: string; weight: string; color: string }> = [
  { key: 'headers', label: 'Headers',  weight: 'HIGH',        color: 'bg-purple-500' },
  { key: 'sender',  label: 'Sender',   weight: 'MEDIUM',      color: 'bg-blue-500'   },
  { key: 'links',   label: 'Links',    weight: 'MEDIUM',      color: 'bg-orange-500' },
  { key: 'content', label: 'Content',  weight: 'LOW–MEDIUM',  color: 'bg-gray-400'   },
];

interface Props { layerScores: LayerScores }

export default function LayerScores({ layerScores }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">Layer analysis</h3>
      <div className="space-y-3">
        {layers.map(({ key, label, weight, color }) => {
          const score = layerScores[key];
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                <span className="font-medium">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{weight}</span>
                  <span className="font-semibold text-gray-700">{score}</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div
                  className={`h-1.5 rounded-full transition-all ${color}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
