import type {
  Classification,
  ExtractedFeatures,
  LayerScores,
  Signal,
  SpamResult,
  ThreatType,
  Verdict,
} from '@/lib/types';
import { analyzeContent } from './content_analysis';
import { analyzeLinks } from './link_analysis';
import { analyzeHeaders } from './header_analysis';
import { analyzeSender } from './sender_analysis';

// Higher weight = more influence on final score
const WEIGHTS = { headers: 1.5, links: 1.2, sender: 1.2, content: 1.0 };
const MAX_RAW = 100 * (WEIGHTS.headers + WEIGHTS.links + WEIGHTS.sender + WEIGHTS.content);

function toVerdict(score: number): Verdict {
  if (score >= 65) return 'PHISHING';
  if (score >= 35) return 'SUSPICIOUS';
  return 'SAFE';
}

function toClassification(v: Verdict): Classification {
  if (v === 'PHISHING') return 'Spam';
  if (v === 'SUSPICIOUS') return 'Likely Spam';
  return 'Safe';
}

function inferThreatType(signals: Signal[], verdict: Verdict): ThreatType {
  if (verdict === 'SAFE') return 'Unknown';
  const names = new Set(signals.map(s => s.name));
  if (names.has('Brand Impersonation') || names.has('Lookalike Domain')) return 'Brand Impersonation';
  if (names.has('Sensitive Data Request') || names.has('From / Reply-To Domain Mismatch')) return 'Credential Harvesting';
  if (names.has('Urgency Language') || names.has('Threat / Account Warning')) return 'Urgency-Based Scam';
  return 'Phishing Attempt';
}

function generateSummary(verdict: Verdict, threat: ThreatType, top: Signal[]): string {
  if (verdict === 'SAFE') {
    return 'No significant phishing indicators detected. This message appears legitimate.';
  }
  const names = top.slice(0, 2).map(s => s.name.toLowerCase()).join(' and ');
  if (verdict === 'PHISHING') return `Strong indicators of ${threat.toLowerCase()} detected due to ${names}.`;
  return `Suspicious patterns detected — including ${names} — commonly associated with phishing.`;
}

function generateReasoning(signals: Signal[], verdict: Verdict): string[] {
  if (verdict === 'SAFE') {
    return ['No recognised phishing patterns detected. The message uses neutral language with no suspicious links, spoofed headers, or impersonation attempts.'];
  }
  const names = new Set(signals.map(s => s.name));
  const pts: string[] = [];

  if (names.has('From / Reply-To Domain Mismatch') || names.has('Return-Path / From Mismatch')) {
    pts.push('Email header mismatches between From, Reply-To, and Return-Path are a primary indicator of email spoofing — used to hide the true origin of the message.');
  }
  if (names.has('Brand Impersonation')) {
    pts.push("The sender's display name impersonates a known brand while using an unrelated domain — a classic technique to establish false trust before requesting sensitive action.");
  }
  if (names.has('Lookalike Domain')) {
    pts.push('A domain closely resembling a known brand was found. Lookalike domains are registered by attackers to deceive users into trusting fraudulent sites.');
  }
  if (names.has('Sensitive Data Request') && pts.length < 3) {
    pts.push('The message requests sensitive credentials. Legitimate organisations never ask for passwords, MFA codes, or card details via email.');
  }
  if ((names.has('SPF Failure') || names.has('DKIM Failure') || names.has('DMARC Failure')) && pts.length < 3) {
    pts.push('Email authentication failures (SPF/DKIM/DMARC) indicate the message may not have originated from the claimed sending domain.');
  }
  if (names.has('Urgency Language') && pts.length < 3) {
    pts.push('Urgency cues exploit fear to bypass rational evaluation, pressuring victims into acting before verifying the sender.');
  }

  return pts.slice(0, 3);
}

function shannonEntropy(text: string): number {
  if (!text) return 0;
  const freq: Record<string, number> = {};
  for (const ch of text) freq[ch] = (freq[ch] ?? 0) + 1;
  const len = text.length;
  return Object.values(freq).reduce((H, c) => { const p = c / len; return H - p * Math.log2(p); }, 0);
}

export function runDetection(features: ExtractedFeatures): SpamResult {
  const contentRes = analyzeContent(features.text);
  const linkRes = analyzeLinks(features.links, features.domains);
  const headerRes = analyzeHeaders(features);
  const senderRes = analyzeSender(features.sender, features.emails);

  const rawScore =
    contentRes.score * WEIGHTS.content +
    linkRes.score * WEIGHTS.links +
    headerRes.score * WEIGHTS.headers +
    senderRes.score * WEIGHTS.sender;

  const riskScore = Math.round(Math.min(100, (rawScore / MAX_RAW) * 100));

  // Sort signals highest-score first, headers & sender first by layer priority
  const allSignals: Signal[] = [
    ...headerRes.signals,
    ...senderRes.signals,
    ...linkRes.signals,
    ...contentRes.signals,
  ].sort((a, b) => b.score - a.score);

  const verdict = toVerdict(riskScore);
  const classification = toClassification(verdict);
  const threatType = inferThreatType(allSignals, verdict);

  const layerScores: LayerScores = {
    content: contentRes.score,
    links: linkRes.score,
    headers: headerRes.score,
    sender: senderRes.score,
  };

  const words = features.text.trim().split(/\s+/).filter(Boolean);
  const metadata = {
    charCount: features.text.length,
    wordCount: words.length,
    linkCount: features.links.length,
    linkDensity: words.length > 0 ? `${((features.links.length / words.length) * 100).toFixed(1)}%` : '0.0%',
    entropy: `${shannonEntropy(features.text).toFixed(2)} bits`,
  };

  const confidence = verdict === 'SAFE'
    ? 90
    : Math.round(Math.min(99, 55 + riskScore * 0.4 + Math.min(allSignals.length * 3, 15)));

  // Pull highlighted keywords from matched phrases in signal explanations
  const matchRe = /matched: (.+)$/;
  const highlightedWords = [...new Set(
    allSignals.flatMap(s => {
      const m = s.explanation.match(matchRe);
      return m ? m[1].split(', ') : [];
    }),
  )];

  return {
    classification,
    verdict,
    riskScore,
    confidence,
    threatType,
    summary: generateSummary(verdict, threatType, allSignals),
    reasoning: generateReasoning(allSignals, verdict),
    signals: allSignals,
    highlightedWords,
    metadata,
    layerScores,
    features,
  };
}
