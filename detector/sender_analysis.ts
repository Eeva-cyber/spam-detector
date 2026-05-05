import type { ModuleResult, Signal } from '@/lib/types';

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.pw', '.club', '.online', '.site', '.icu'];

const BRAND_KEYWORDS = [
  'paypal', 'amazon', 'microsoft', 'google', 'apple', 'netflix',
  'facebook', 'instagram', 'twitter', 'linkedin', 'dropbox',
  'wellsfargo', 'chase', 'bankofamerica', 'citibank', 'irs',
  'support', 'security', 'billing', 'helpdesk',
];

function suspiciousTld(domain: string): string | null {
  return SUSPICIOUS_TLDS.find(tld => domain.endsWith(tld)) ?? null;
}

function numericInSld(domain: string): boolean {
  // Flag domains where the second-level part contains 2+ consecutive digits
  const sld = domain.split('.').slice(-2, -1)[0] ?? '';
  return /\d{2,}/.test(sld);
}

function displayName(raw: string): string {
  const m = raw.match(/^"?([^"<]+)"?\s*</) ?? raw.match(/^([^@<\s]+)\s+/);
  return m?.[1]?.trim().toLowerCase() ?? '';
}

function emailAddr(raw: string): string {
  const m = raw.match(/<([^>]+)>/) ?? raw.match(/([\w.+-]+@[\w-]+\.[\w.]+)/);
  return m?.[1]?.toLowerCase().trim() ?? '';
}

function impersonatedBrand(name: string, domain: string): string | null {
  for (const brand of BRAND_KEYWORDS) {
    if (name.includes(brand) && !domain.includes(brand)) return brand;
  }
  return null;
}

export function analyzeSender(sender: string, emails: string[]): ModuleResult {
  const candidates = [sender, ...emails].filter(Boolean);
  const signals: Signal[] = [];
  const seen = new Set<string>();

  function addOnce(s: Signal) {
    if (!seen.has(s.ruleId)) { seen.add(s.ruleId); signals.push(s); }
  }

  for (const raw of candidates) {
    const addr = emailAddr(raw) || raw;
    if (!addr.includes('@')) continue;
    const domain = addr.split('@')[1]?.toLowerCase() ?? '';

    const tld = suspiciousTld(domain);
    if (tld) {
      addOnce({
        name: 'Suspicious TLD',
        ruleId: 'SENDER_001',
        score: 25,
        explanation: `Domain uses a high-risk TLD (${tld}): ${domain}`,
        layer: 'sender',
      });
    }

    if (numericInSld(domain)) {
      addOnce({
        name: 'Numeric Domain Pattern',
        ruleId: 'SENDER_002',
        score: 15,
        explanation: `Domain contains suspicious numeric sequences: ${domain}`,
        layer: 'sender',
      });
    }

    const name = displayName(raw);
    if (name) {
      const brand = impersonatedBrand(name, domain);
      if (brand) {
        addOnce({
          name: 'Brand Impersonation',
          ruleId: 'SENDER_003',
          score: 45,
          explanation: `Display name claims to be "${brand}" but email domain (${domain}) doesn't match.`,
          layer: 'sender',
        });
      }
    }
  }

  return { score: Math.min(100, signals.reduce((s, x) => s + x.score, 0)), signals };
}
