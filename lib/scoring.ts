import {
  detectAggressiveCaps,
  detectCallToAction,
  detectExcessivePunctuation,
  detectLinks,
  detectPromotionalBait,
  detectUrgencyLanguage,
} from './spamRules';
import type { Classification, RuleMatch, Signal, SpamResult, ThreatType } from './types';

function classify(score: number): Classification {
  if (score > 70) return 'Spam';
  if (score >= 40) return 'Likely Spam';
  return 'Safe';
}

function computeConfidence(score: number, numSignals: number): number {
  if (score === 0) return 90;
  const signalBonus = Math.min(numSignals * 5, 20);
  if (score > 70) return Math.min(99, 80 + signalBonus);
  if (score >= 40) return Math.min(99, 60 + signalBonus);
  return Math.min(99, 40 + signalBonus);
}

function inferThreatType(signals: Signal[], classification: Classification): ThreatType {
  if (classification === 'Safe') return 'Unknown';

  const names = new Set(signals.map((s) => s.name));

  if (names.has('External Link')) return 'Phishing Attempt';
  if (names.has('Urgency Language')) return 'Urgency-Based Scam';
  if (names.has('Promotional Bait')) return 'Promotional Spam';
  return 'Unknown';
}

function generateSummary(
  classification: Classification,
  threatType: ThreatType,
  signals: Signal[],
): string {
  if (classification === 'Safe') {
    return 'No significant spam indicators were detected. This message appears legitimate.';
  }

  const topNames = signals
    .slice(0, 2)
    .map((s) => s.name.toLowerCase())
    .join(' and ');

  if (classification === 'Spam') {
    return `This message shows strong indicators of ${threatType.toLowerCase()} due to ${topNames}.`;
  }

  return `This message contains suspicious patterns — including ${topNames} — commonly associated with spam.`;
}

function generateReasoning(signals: Signal[], classification: Classification): string[] {
  if (classification === 'Safe') {
    return [
      'No recognized spam patterns were detected. The message uses neutral language with no suspicious links, urgency cues, or manipulation tactics.',
    ];
  }

  const names = new Set(signals.map((s) => s.name));
  const points: string[] = [];

  if (names.has('External Link') && (names.has('Urgency Language') || names.has('Call-to-Action Phrase'))) {
    points.push(
      'Combining an external link with urgency or call-to-action language is a textbook phishing pattern — engineered to make targets act before thinking critically.',
    );
  } else if (names.has('External Link')) {
    points.push(
      'External links embedded in unsolicited messages are a primary delivery mechanism for phishing campaigns and malware distribution.',
    );
  }

  if (names.has('Urgency Language')) {
    points.push(
      "Urgency cues such as 'urgent' or 'limited time' exploit fear of missing out (FOMO), bypassing rational evaluation and pressuring victims into immediate, unverified action.",
    );
  }

  if (names.has('Promotional Bait')) {
    points.push(
      "Offers of free prizes or winnings are a social engineering technique designed to lower the recipient's guard and elicit clicks or the disclosure of personal information.",
    );
  }

  if (names.has('Aggressive Capitalization') && points.length < 3) {
    points.push(
      'Excessive ALL CAPS usage is a visual aggression tactic that mimics known spam formatting, designed to override skepticism through sheer intensity.',
    );
  }

  if (names.has('Excessive Punctuation') && points.length < 3) {
    points.push(
      'Repeated exclamation marks are a low-sophistication spam signal used to amplify emotional urgency in promotional and scam messages.',
    );
  }

  return points.slice(0, 3);
}

export function analyzeMessage(message: string): SpamResult {
  const ruleMatches: RuleMatch[] = [
    detectUrgencyLanguage(message),
    detectPromotionalBait(message),
    detectCallToAction(message),
    detectLinks(message),
    detectExcessivePunctuation(message),
    detectAggressiveCaps(message),
  ];

  const allSignals = ruleMatches.flatMap((r) => r.signals);
  const rawScore = allSignals.reduce((sum, s) => sum + s.score, 0);
  const riskScore = Math.min(100, rawScore);

  const classification = classify(riskScore);
  const confidence = computeConfidence(riskScore, allSignals.length);
  const threatType = inferThreatType(allSignals, classification);
  const summary = generateSummary(classification, threatType, allSignals);
  const reasoning = generateReasoning(allSignals, classification);
  const highlightedWords = [...new Set(ruleMatches.flatMap((r) => r.matchedWords))];

  return {
    classification,
    riskScore,
    confidence,
    threatType,
    summary,
    reasoning,
    signals: allSignals,
    highlightedWords,
  };
}
