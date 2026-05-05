'use client';

import { useState } from 'react';
import type { SpamResult } from '@/lib/types';
import HighlightedText from '@/components/HighlightedText';
import ResultCard from '@/components/ResultCard';
import SignalBreakdown from '@/components/SignalBreakdown';
import LayerScores from '@/components/LayerScores';

const PHISHING_EXAMPLE =
  'From: "PayPal Support" <support@paypa1-secure.xyz>\n' +
  'Reply-To: refunds@collect-now.tk\n' +
  'Return-Path: <bounce@paypa1-secure.xyz>\n' +
  'Authentication-Results: spf=fail; dkim=none; dmarc=fail\n\n' +
  'URGENT: Your PayPal account has been suspended due to suspicious activity. ' +
  'Verify your account immediately or access will be terminated within 24 hours. ' +
  'Click here: http://paypa1-secure.xyz/verify?token=ABC123 — provide your password and verification code now.';

const SAFE_EXAMPLE =
  "Hi Sarah, I hope you're having a great week! I just wanted to confirm our meeting on Thursday at 2pm. Let me know if that still works for you.";

export default function Page() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<SpamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function checkMessage() {
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

  return (
    <main className="min-h-screen bg-slate-50 px-4">
      <div
        className={`mx-auto w-full max-w-xl ${
          result === null ? 'flex min-h-screen flex-col justify-center py-10' : 'py-14'
        }`}
      >
        <header className={result === null ? 'mb-8 text-center' : 'mb-6'}>
          <h1 className="text-2xl font-bold text-gray-900">Phishing Detector</h1>
          <p className="mt-1 text-sm text-gray-500">
            Paste an email or message to analyse headers, links, sender, and content.
          </p>
        </header>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Message to analyse
            </label>
            <textarea
              value={message}
              onChange={e => { setMessage(e.target.value); setResult(null); }}
              placeholder={'Paste email content, headers, or any message here…\n\nTip: CTRL + A to select all and include "From:", "Reply-To:", or "Authentication-Results:" lines for full header analysis.'}
              rows={6}
              className="w-full resize-none text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <div className="flex gap-3">
              <button
                onClick={() => loadExample(PHISHING_EXAMPLE)}
                className="text-xs text-gray-400 transition hover:text-gray-600"
              >
                Try phishing example
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
              onClick={checkMessage}
              disabled={!message.trim() || loading}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analysing…
                </span>
              ) : (
                'Run Analysis'
              )}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}

        {result && (
          <div className="mt-5 space-y-3">
            <ResultCard result={result} />
            <LayerScores layerScores={result.layerScores} />
            <SignalBreakdown signals={result.signals} />

            {/* Advanced / technical details */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <button
                onClick={() => setShowAdvanced(v => !v)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-600">Technical details</span>
                <span className="text-sm text-gray-400">{showAdvanced ? '↑ Hide' : '↓ Show'}</span>
              </button>

              {showAdvanced && (
                <div className="space-y-5 border-t border-gray-100 p-5">
                  {/* Metadata */}
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

                  {/* Extracted features */}
                  {(result.features.domains.length > 0 || result.features.emails.length > 0 || result.features.sender) && (
                    <div>
                      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Extracted features
                      </p>
                      <div className="space-y-1.5 rounded-lg bg-gray-50 p-3.5 text-xs text-gray-600">
                        {result.features.sender && (
                          <p><span className="font-medium text-gray-500">Sender:</span> {result.features.sender}</p>
                        )}
                        {result.features.replyTo && (
                          <p><span className="font-medium text-gray-500">Reply-To:</span> {result.features.replyTo}</p>
                        )}
                        {result.features.domains.length > 0 && (
                          <p><span className="font-medium text-gray-500">Domains:</span> {result.features.domains.join(', ')}</p>
                        )}
                        {result.features.emails.length > 0 && (
                          <p><span className="font-medium text-gray-500">Emails:</span> {result.features.emails.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Flagged content */}
                  {result.highlightedWords.length > 0 && (
                    <div>
                      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Flagged content
                      </p>
                      <div className="rounded-lg bg-gray-50 p-3.5">
                        <HighlightedText text={message} highlightWords={result.highlightedWords} />
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
          Rule-based phishing detection · No external API calls
        </p>
      </div>
    </main>
  );
}
