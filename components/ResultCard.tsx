'use client';

import type { SpamResult } from '@/lib/types';

type Classification = SpamResult['classification'];
type ThreatType = SpamResult['threatType'];

const classificationBadge: Record<Classification, string> = {
  Spam: 'bg-red-100 text-red-800 border border-red-200',
  'Likely Spam': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  Safe: 'bg-green-100 text-green-800 border border-green-200',
};

const threatBadge: Record<ThreatType, string> = {
  'Phishing Attempt': 'bg-red-50 text-red-600 border border-red-100',
  'Urgency-Based Scam': 'bg-orange-50 text-orange-700 border border-orange-100',
  'Promotional Spam': 'bg-blue-50 text-blue-700 border border-blue-100',
  Unknown: 'bg-gray-50 text-gray-500 border border-gray-200',
};

const barColor: Record<Classification, string> = {
  Spam: 'bg-red-500',
  'Likely Spam': 'bg-yellow-400',
  Safe: 'bg-green-500',
};

interface Props {
  result: SpamResult;
}

export default function ResultCard({ result }: Props) {
  const { classification, threatType, riskScore, confidence, summary, reasoning } = result;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header row: classification + threat type + confidence */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3.5 py-1 text-sm font-semibold ${classificationBadge[classification]}`}>
          {classification}
        </span>
        {classification !== 'Safe' && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${threatBadge[threatType]}`}>
            {threatType}
          </span>
        )}
        <span className="ml-auto text-sm text-gray-500">
          Confidence:{' '}
          <span className="font-semibold text-gray-700">{confidence}%</span>
        </span>
      </div>

      {/* Verdict summary */}
      <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
        <p className="text-sm text-gray-600">{summary}</p>
      </div>

      {/* Risk score bar with zone labels */}
      <div className="mt-5">
        <div className="mb-1.5 flex justify-between text-sm text-gray-600">
          <span>Risk Score</span>
          <span className="font-medium">{riskScore} / 100</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full">
          {/* Zone backgrounds */}
          <div className="absolute inset-0 flex">
            <div className="h-full w-[40%] bg-green-100" />
            <div className="h-full w-[30%] bg-yellow-100" />
            <div className="h-full flex-1 bg-red-100" />
          </div>
          {/* Zone dividers */}
          <div className="absolute inset-y-0 left-[40%] w-px bg-white/70" />
          <div className="absolute inset-y-0 left-[70%] w-px bg-white/70" />
          {/* Score fill */}
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${barColor[classification]}`}
            style={{ width: `${riskScore}%` }}
          />
        </div>
        <div className="mt-1.5 flex text-xs text-gray-400">
          <span className="w-[40%]">Safe</span>
          <span className="w-[30%] text-center">Suspicious</span>
          <span className="flex-1 text-right">High Risk</span>
        </div>
      </div>

      {/* Reasoning */}
      <div className="mt-5">
        <p className="mb-2.5 text-sm font-semibold text-gray-700">Analysis</p>
        <ul className="space-y-2">
          {reasoning.map((point, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
