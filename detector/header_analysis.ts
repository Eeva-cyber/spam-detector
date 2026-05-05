import type { ExtractedFeatures, ModuleResult, Signal } from '@/lib/types';

// Pattern-based auth checks — no DNS, demo-safe
const SPF_FAIL = /spf[=:\s]+(?:fail|softfail|permerror|temperror)/i;
const SPF_PASS = /spf[=:\s]+pass/i;
const DKIM_FAIL = /dkim[=:\s]+(?:fail|none|permerror|temperror)/i;
const DKIM_PASS = /dkim[=:\s]+pass/i;
const DMARC_FAIL = /dmarc[=:\s]+(?:fail|none)/i;

function emailAddr(raw: string): string {
  const m = raw.match(/<([^>]+)>/) ?? raw.match(/([\w.+-]+@[\w-]+\.[\w.]+)/);
  return m?.[1]?.toLowerCase().trim() ?? '';
}

function emailDomain(addr: string): string {
  return addr.split('@')[1]?.toLowerCase() ?? '';
}

export function analyzeHeaders(features: ExtractedFeatures): ModuleResult {
  const { text, headers, sender, replyTo } = features;
  const signals: Signal[] = [];

  const hasHeaderLines = Object.keys(headers).length > 0;

  if (SPF_FAIL.test(text)) {
    signals.push({
      name: 'SPF Failure',
      ruleId: 'HEADER_001',
      score: 35,
      explanation: 'SPF check failed — the sending server is not authorised for this domain.',
      layer: 'headers',
    });
  } else if (hasHeaderLines && !SPF_PASS.test(text)) {
    signals.push({
      name: 'SPF Not Verified',
      ruleId: 'HEADER_001B',
      score: 10,
      explanation: 'Headers present but no SPF pass result found — authentication unconfirmed.',
      layer: 'headers',
    });
  }

  if (DKIM_FAIL.test(text) && !DKIM_PASS.test(text)) {
    signals.push({
      name: 'DKIM Failure',
      ruleId: 'HEADER_002',
      score: 30,
      explanation: 'DKIM signature invalid or absent — message integrity cannot be verified.',
      layer: 'headers',
    });
  }

  if (DMARC_FAIL.test(text)) {
    signals.push({
      name: 'DMARC Failure',
      ruleId: 'HEADER_003',
      score: 35,
      explanation: 'DMARC policy failed — sender domain alignment could not be confirmed.',
      layer: 'headers',
    });
  }

  // From vs Reply-To domain mismatch
  if (sender && replyTo) {
    const fromAddr = emailAddr(sender);
    const replyAddr = emailAddr(replyTo);
    if (fromAddr && replyAddr && fromAddr !== replyAddr) {
      const fromDomain = emailDomain(fromAddr);
      const replyDomain = emailDomain(replyAddr);
      if (fromDomain && replyDomain && fromDomain !== replyDomain) {
        signals.push({
          name: 'From / Reply-To Domain Mismatch',
          ruleId: 'HEADER_004',
          score: 40,
          explanation: `Sender domain (${fromDomain}) differs from Reply-To domain (${replyDomain}) — classic spoofing indicator.`,
          layer: 'headers',
        });
      }
    }
  }

  // Return-Path vs From domain mismatch
  const returnPath = headers['return-path'] ?? '';
  if (returnPath && sender) {
    const fromAddr = emailAddr(sender);
    const returnAddr = emailAddr(returnPath);
    if (fromAddr && returnAddr && fromAddr !== returnAddr) {
      const fromDomain = emailDomain(fromAddr);
      const returnDomain = emailDomain(returnAddr);
      if (fromDomain && returnDomain && fromDomain !== returnDomain) {
        signals.push({
          name: 'Return-Path / From Mismatch',
          ruleId: 'HEADER_005',
          score: 30,
          explanation: `Return-Path domain (${returnDomain}) differs from From domain (${fromDomain}).`,
          layer: 'headers',
        });
      }
    }
  }

  return { score: Math.min(100, signals.reduce((s, x) => s + x.score, 0)), signals };
}
