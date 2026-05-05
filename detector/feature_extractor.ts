import type { ExtractedFeatures } from '@/lib/types';

const LINK_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
const BARE_WWW_REGEX = /(?:^|\s)(www\.[^\s<>"]+)/gi;
const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[\w.]+/gi;
const HEADER_LINE_REGEX = /^([\w-]+):\s*(.+)$/gm;
const SENDER_PATTERN = /^(?:From|Sender):\s*(.+)$/im;
const REPLY_TO_PATTERN = /^Reply-To:\s*(.+)$/im;

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    const m = url.match(/(?:https?:\/\/)?([^/?\s]+)/i);
    return m?.[1]?.toLowerCase() ?? '';
  }
}

export function extractFeatures(input: string): ExtractedFeatures {
  const links: string[] = [];

  for (const m of input.matchAll(LINK_REGEX)) links.push(m[0]);
  for (const m of input.matchAll(BARE_WWW_REGEX)) links.push(m[1]);

  const domains = [...new Set(links.map(extractDomain).filter(Boolean))];

  const emails: string[] = [];
  for (const m of input.matchAll(EMAIL_REGEX)) emails.push(m[0].toLowerCase());

  const headers: Record<string, string> = {};
  for (const m of input.matchAll(HEADER_LINE_REGEX)) {
    const key = m[1].toLowerCase();
    if (!headers[key]) headers[key] = m[2].trim();
  }

  const senderMatch = input.match(SENDER_PATTERN);
  let sender = senderMatch ? senderMatch[1].trim() : '';
  if (!sender && emails.length > 0) sender = emails[0];

  const replyToMatch = input.match(REPLY_TO_PATTERN);
  const replyTo = replyToMatch ? replyToMatch[1].trim() : '';

  return { text: input, links, domains, emails, headers, sender, replyTo };
}
