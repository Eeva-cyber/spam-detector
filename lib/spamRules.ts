import type { RuleMatch } from './types';

const URGENCY_KEYWORDS = ['urgent', 'limited time'] as const;
const PROMOTIONAL_KEYWORDS = ['free', 'win'] as const;
const CTA_KEYWORDS = ['click here'] as const;
const LINK_PATTERNS = ['http', 'www', 'bit.ly'] as const;
const PUNCTUATION_PATTERNS = ['!!!', '???'] as const;
const MIN_CAPS_WORD_LENGTH = 3;
const MAX_CAPS_SCORE = 30;

export function detectUrgencyLanguage(text: string): RuleMatch {
  const lower = text.toLowerCase();
  const matched = URGENCY_KEYWORDS.filter((kw) => lower.includes(kw));

  if (matched.length === 0) return { signals: [], matchedWords: [] };

  return {
    signals: [
      {
        name: 'Urgency Language',
        score: matched.length * 25,
        explanation:
          'Creates artificial time pressure to prevent recipients from verifying authenticity before acting.',
      },
    ],
    matchedWords: [...matched],
  };
}

export function detectPromotionalBait(text: string): RuleMatch {
  const lower = text.toLowerCase();
  const matched = PROMOTIONAL_KEYWORDS.filter((kw) => lower.includes(kw));

  if (matched.length === 0) return { signals: [], matchedWords: [] };

  return {
    signals: [
      {
        name: 'Promotional Bait',
        score: matched.length * 20,
        explanation:
          'Unrealistic reward offers are a classic social engineering lure used to attract clicks and harvest personal data.',
      },
    ],
    matchedWords: [...matched],
  };
}

export function detectCallToAction(text: string): RuleMatch {
  const lower = text.toLowerCase();
  const matched = CTA_KEYWORDS.filter((kw) => lower.includes(kw));

  if (matched.length === 0) return { signals: [], matchedWords: [] };

  return {
    signals: [
      {
        name: 'Call-to-Action Phrase',
        score: 20,
        explanation:
          'Generic action phrases guide targets to external destinations without revealing where they lead — a standard phishing technique.',
      },
    ],
    matchedWords: [...matched],
  };
}

export function detectLinks(text: string): RuleMatch {
  const lower = text.toLowerCase();
  const found = LINK_PATTERNS.filter((p) => lower.includes(p));

  if (found.length === 0) return { signals: [], matchedWords: [] };

  return {
    signals: [
      {
        name: 'External Link',
        score: 30,
        explanation:
          'URLs in unsolicited messages frequently redirect to credential-harvesting pages or malware-delivery sites.',
      },
    ],
    matchedWords: [...found],
  };
}

export function detectExcessivePunctuation(text: string): RuleMatch {
  const found = PUNCTUATION_PATTERNS.filter((p) => text.includes(p));

  if (found.length === 0) return { signals: [], matchedWords: [] };

  return {
    signals: [
      {
        name: 'Excessive Punctuation',
        score: 15,
        explanation:
          'Repeated exclamation or question marks amplify emotional urgency to trigger impulsive, uncritical responses.',
      },
    ],
    matchedWords: [...found],
  };
}

export function detectAggressiveCaps(text: string): RuleMatch {
  const words = text.split(/\s+/);
  const capsWords = [
    ...new Set(
      words
        .map((w) => w.replace(/[^a-zA-Z]/g, ''))
        .filter(
          (w) =>
            w.length >= MIN_CAPS_WORD_LENGTH &&
            w === w.toUpperCase() &&
            /[A-Z]/.test(w),
        ),
    ),
  ];

  if (capsWords.length === 0) return { signals: [], matchedWords: [] };

  return {
    signals: [
      {
        name: 'Aggressive Capitalization',
        score: Math.min(MAX_CAPS_SCORE, capsWords.length * 10),
        explanation:
          'ALL CAPS text mimics aggressive spam formatting to demand attention and convey false authority or urgency.',
      },
    ],
    matchedWords: [],
  };
}
