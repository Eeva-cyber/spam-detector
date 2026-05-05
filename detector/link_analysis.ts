import type { ModuleResult, Signal } from '@/lib/types';

const SHORTENER_HOSTS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd',
  'buff.ly', 'rebrand.ly', 'tiny.cc', 'shorte.st', 'clck.ru', 'rb.gy',
]);

const LOOKALIKE_BRANDS = [
  'paypal', 'amazon', 'microsoft', 'google', 'apple', 'netflix',
  'facebook', 'instagram', 'twitter', 'linkedin', 'dropbox',
  'wellsfargo', 'chase', 'bankofamerica', 'citibank',
];

// Bigram-based similarity score (0–1)
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = (s: string) => new Set(Array.from({ length: s.length - 1 }, (_, i) => s.slice(i, i + 2)));
  const aSet = bigrams(a);
  const bSet = bigrams(b);
  const hits = [...aSet].filter(x => bSet.has(x)).length;
  return (2 * hits) / (aSet.size + bSet.size);
}

function isShortener(domain: string): boolean {
  return SHORTENER_HOSTS.has(domain);
}

function findLookalike(domain: string): string | null {
  const parts = domain.split('.');
  // base = everything before the TLD, stripped of separators
  const base = parts.slice(0, -1).join('').replace(/[-_0-9]/g, '');
  for (const brand of LOOKALIKE_BRANDS) {
    if (base === brand) continue; // exact match is fine
    if (similarity(base, brand) > 0.75) return brand;
    // catch brand embedded in domain at non-official TLD: "paypal-secure.net"
    if (base.includes(brand) && parts[parts.length - 1] !== 'com') return brand;
  }
  return null;
}

export function analyzeLinks(links: string[], domains: string[]): ModuleResult {
  if (links.length === 0) return { score: 0, signals: [] };

  const signals: Signal[] = [];

  const shortened = domains.filter(isShortener);
  if (shortened.length > 0) {
    signals.push({
      name: 'URL Shortener Detected',
      ruleId: 'LINK_001',
      score: 25,
      explanation: `Shortened URLs hide the real destination: ${shortened.join(', ')}`,
      layer: 'links',
    });
  }

  const httpLinks = links.filter(l => l.toLowerCase().startsWith('http://'));
  if (httpLinks.length > 0) {
    signals.push({
      name: 'Non-HTTPS Link',
      ruleId: 'LINK_002',
      score: 20,
      explanation: 'Plain HTTP transmits data unencrypted — common in phishing lures.',
      layer: 'links',
    });
  }

  // Deep subdomain structure: more than 3 dot-separated parts
  const deepSubs = domains.filter(d => d.split('.').length > 3);
  if (deepSubs.length > 0) {
    signals.push({
      name: 'Suspicious Subdomain Structure',
      ruleId: 'LINK_003',
      score: 20,
      explanation: `Deep subdomains can disguise malicious hosts: ${deepSubs.slice(0, 2).join(', ')}`,
      layer: 'links',
    });
  }

  const lookalikes: string[] = [];
  for (const d of domains) {
    const brand = findLookalike(d);
    if (brand) lookalikes.push(`${d} ≈ ${brand}`);
  }
  if (lookalikes.length > 0) {
    signals.push({
      name: 'Lookalike Domain',
      ruleId: 'LINK_004',
      score: 40,
      explanation: `Domain resembles a known brand: ${lookalikes.join(', ')}`,
      layer: 'links',
    });
  }

  return { score: Math.min(100, signals.reduce((s, x) => s + x.score, 0)), signals };
}
