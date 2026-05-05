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

  async function checkSpam() {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

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
  }

  function handleMessageChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(e.target.value);
    setResult(null);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-14">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Spam Detector</h1>
          <p className="mt-2 text-base text-gray-500">
            Paste any message below to check if it looks like spam.
          </p>
        </header>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <textarea
            value={message}
            onChange={handleMessageChange}
            placeholder="Paste or type a message here..."
            rows={5}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-3 flex gap-3">
            <button
              onClick={() => loadExample(SPAM_EXAMPLE)}
              className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition"
            >
              Try spam example
            </button>
            <span className="text-xs text-gray-300">·</span>
            <button
              onClick={() => loadExample(SAFE_EXAMPLE)}
              className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition"
            >
              Try safe example
            </button>
          </div>

          <button
            onClick={checkSpam}
            disabled={!message.trim() || loading}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Analyzing...
              </>
            ) : (
              'Check Spam'
            )}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-500">{error}</p>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <ResultCard result={result} />
            <SignalBreakdown signals={result.signals} />
            {result.highlightedWords.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="mb-3 text-sm font-semibold text-gray-700">Highlighted Message</p>
                <HighlightedText text={message} highlightWords={result.highlightedWords} />
              </div>
            )}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-gray-400">
          This system uses rule-based detection. It can be upgraded to ML or API-based detection.
        </p>
      </div>
    </main>
  );
}
