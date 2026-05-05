import type { ModuleResult, Signal } from '@/lib/types';

const URGENCY_PHRASES = [
  'act now', 'urgent', 'immediately', 'limited time', 'expires soon',
  'last chance', "don't wait", 'respond immediately', 'within 24 hours',
  'final notice', 'important notice', 'action required',
];

const THREAT_PHRASES = [
  'account suspended', 'account will be closed', 'verify now',
  'verify your account', 'access will be terminated', 'unauthorized access',
  'security alert', 'suspicious activity', 'account blocked', 'login attempt',
];

const SENSITIVE_PHRASES = [
  'password', 'social security', 'credit card', 'bank account',
  'mfa code', 'one-time code', 'verification code', 'pin number',
  'date of birth', 'cvv', 'routing number',
];

function matched(lower: string, phrases: string[]): string[] {
  return phrases.filter(p => lower.includes(p));
}

export function analyzeContent(text: string): ModuleResult {
  const lower = text.toLowerCase();
  const signals: Signal[] = [];

  const urgency = matched(lower, URGENCY_PHRASES);
  if (urgency.length > 0) {
    signals.push({
      name: 'Urgency Language',
      ruleId: 'CONTENT_001',
      score: Math.min(30, urgency.length * 10),
      explanation: `Creates artificial time pressure — matched: ${urgency.slice(0, 3).join(', ')}`,
      layer: 'content',
    });
  }

  const threats = matched(lower, THREAT_PHRASES);
  if (threats.length > 0) {
    signals.push({
      name: 'Threat / Account Warning',
      ruleId: 'CONTENT_002',
      score: Math.min(35, threats.length * 15),
      explanation: `Coerces action through account threat — matched: ${threats.slice(0, 2).join(', ')}`,
      layer: 'content',
    });
  }

  const sensitive = matched(lower, SENSITIVE_PHRASES);
  if (sensitive.length > 0) {
    signals.push({
      name: 'Sensitive Data Request',
      ruleId: 'CONTENT_003',
      score: Math.min(40, sensitive.length * 20),
      explanation: `Requests credentials or personal info — matched: ${sensitive.slice(0, 2).join(', ')}`,
      layer: 'content',
    });
  }

  const capsWords = [
    ...new Set(
      text.split(/\s+/)
        .map(w => w.replace(/[^a-zA-Z]/g, ''))
        .filter(w => w.length >= 3 && w === w.toUpperCase() && /[A-Z]/.test(w)),
    ),
  ];
  if (capsWords.length >= 3) {
    signals.push({
      name: 'Aggressive Capitalization',
      ruleId: 'CONTENT_004',
      score: Math.min(20, capsWords.length * 5),
      explanation: 'Excessive ALL CAPS mimics spam formatting to convey false authority.',
      layer: 'content',
    });
  }

  if (/[!?]{3,}/.test(text)) {
    signals.push({
      name: 'Excessive Punctuation',
      ruleId: 'CONTENT_005',
      score: 10,
      explanation: 'Repeated punctuation amplifies emotional urgency to drive impulsive action.',
      layer: 'content',
    });
  }

  return { score: Math.min(100, signals.reduce((s, x) => s + x.score, 0)), signals };
}
