'use client';

import { useState } from 'react';
import type { SpamResult } from '@/lib/types';
import HighlightedText from '@/components/HighlightedText';
import ResultCard from '@/components/ResultCard';
import SignalBreakdown from '@/components/SignalBreakdown';

const SPAM_EXAMPLE =
  "CLICK HERE NOW! You've WON a FREE prize! This is an URGENT limited time offer! Visit http://www.example.com to claim!!!";

const SAFE_EXAMPLE =
  "Hi Sarah, I hope you're having a great week! I just wanted to confirm our meeting on Thursday at 2pm. Let me know if that still works for you.";

export default function Page() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<SpamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function checkSpam() {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setShowAdvanced(false);

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data = (await res.json()) as SpamResult;
      setResult(data);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function loadExample(text: string) {
    setMessage(text);
    setResult(null);
    setError(null);
    setShowAdvanced(false);
  }

  function handleMessageChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(e.target.value);
    setResult(null);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4">
      <div
        className={`mx-auto w-full max-w-xl ${
          result === null ? 'flex min-h-screen flex-col justify-center py-10' : 'py-14'
        }`}
      >
        {/* Header */}
        <header className={result === null ? 'mb-8 text-center' : 'mb-6'}>
          <h1 className="text-2xl font-bold text-gray-900">Spam Detector</h1>
          <p className="mt-1 text-sm text-gray-500">
            Paste any message to check if it looks like spam.
          </p>
        </header>

        {/* Input card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Message to analyze
            </label>
            <textarea
              value={message}
              onChange={handleMessageChange}
              placeholder="Paste or type a message here..."
              rows={5}
              className="w-full resize-none text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <div className="flex gap-3">
              <button
                onClick={() => loadExample(SPAM_EXAMPLE)}
                className="text-xs text-gray-400 transition hover:text-gray-600"
              >
                Try spam example
              </button>
              <span className="text-xs text-gray-200">·</span>
              <button
                onClick={() => loadExample(SAFE_EXAMPLE)}
                className="text-xs text-gray-400 transition hover:text-gray-600"
              >
                Try safe message
              </button>
            </div>

            <button
              onClick={checkSpam}
              disabled={!message.trim() || loading}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyzing…
                </span>
              ) : (
                'Run Analysis'
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-center text-sm text-red-500">{error}</p>
        )}

        {result && (
          <div className="mt-5 space-y-3">
            <ResultCard result={result} />
            <SignalBreakdown signals={result.signals} />

            {/* Advanced collapsible */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-600">Technical details</span>
                <span className="text-sm text-gray-400">{showAdvanced ? '↑ Hide' : '↓ Show'}</span>
              </button>

              {showAdvanced && (
                <div className="space-y-5 border-t border-gray-100 p-5">
                  {/* Metadata grid */}
                  <div>
                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Metadata
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          ['Characters', result.metadata.charCount],
                          ['Words', result.metadata.wordCount],
                          ['Links', result.metadata.linkCount],
                          ['Link density', result.metadata.linkDensity],
                          ['Entropy', result.metadata.entropy],
                        ] as [string, string | number][]
                      ).map(([label, value]) => (
                        <div key={label} className="rounded-lg bg-gray-50 px-3 py-2.5">
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-700">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flagged content */}
                  {result.highlightedWords.length > 0 && (
                    <div>
                      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Flagged content
                      </p>
                      <div className="rounded-lg bg-gray-50 p-3.5">
                        <HighlightedText
                          text={message}
                          highlightWords={result.highlightedWords}
                        />
                      </div>
                    </div>
                  )}

                  {/* Raw JSON */}
                  <div>
                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Raw output
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-gray-50 p-3.5 font-mono text-[11px] leading-relaxed text-gray-500">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-gray-300">
          Rule-based detection · No external API calls
        </p>
      </div>
    </main>
  );
}
