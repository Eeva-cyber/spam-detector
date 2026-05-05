export type Classification = 'Spam' | 'Likely Spam' | 'Safe';
export type ThreatType = 'Phishing Attempt' | 'Urgency-Based Scam' | 'Promotional Spam' | 'Unknown';

export interface Signal {
  name: string;
  score: number;
  explanation: string;
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
}

export interface RuleMatch {
  signals: Signal[];
  matchedWords: string[];
}
