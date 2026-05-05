export type Classification = 'Spam' | 'Likely Spam' | 'Safe';
export type ThreatType = 'Phishing Attempt' | 'Urgency-Based Scam' | 'Promotional Spam' | 'Unknown';

export interface Signal {
  name: string;
  ruleId: string;
  score: number;
  explanation: string;
}

export interface MessageMetadata {
  charCount: number;
  wordCount: number;
  linkCount: number;
  linkDensity: string;
  entropy: string;
}

export interface SpamResult {
  classification: Classification;
  riskScore: number;
  confidence: number;
  threatType: ThreatType;
  summary: string;
  reasoning: string[];
  signals: Signal[];
  highlightedWords: string[];
  metadata: MessageMetadata;
}

export interface RuleMatch {
  signals: Signal[];
  matchedWords: string[];
}
