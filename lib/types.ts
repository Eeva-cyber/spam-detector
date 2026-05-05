export type Classification = 'Spam' | 'Likely Spam' | 'Safe';
export type Verdict = 'PHISHING' | 'SUSPICIOUS' | 'SAFE';
export type ThreatType =
  | 'Phishing Attempt'
  | 'Urgency-Based Scam'
  | 'Promotional Spam'
  | 'Brand Impersonation'
  | 'Credential Harvesting'
  | 'Unknown';

export type SignalLayer = 'content' | 'links' | 'headers' | 'sender';

export interface Signal {
  name: string;
  ruleId: string;
  score: number;
  explanation: string;
  layer: SignalLayer;
}

export interface ModuleResult {
  score: number;
  signals: Signal[];
}

export interface ExtractedFeatures {
  text: string;
  links: string[];
  domains: string[];
  emails: string[];
  headers: Record<string, string>;
  sender: string;
  replyTo: string;
}

export interface LayerScores {
  content: number;
  links: number;
  headers: number;
  sender: number;
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
  verdict: Verdict;
  riskScore: number;
  confidence: number;
  threatType: ThreatType;
  summary: string;
  reasoning: string[];
  signals: Signal[];
  highlightedWords: string[];
  metadata: MessageMetadata;
  layerScores: LayerScores;
  features: ExtractedFeatures;
}

export interface RuleMatch {
  signals: Signal[];
  matchedWords: string[];
}
