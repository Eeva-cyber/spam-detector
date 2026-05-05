'use client';

interface Props {
  text: string;
  highlightWords: string[];
}

interface TextPart {
  text: string;
  highlight: boolean;
}

function splitWithHighlights(text: string, words: string[]): TextPart[] {
  if (words.length === 0) return [{ text, highlight: false }];

  const sorted = [...words].sort((a, b) => b.length - a.length);
  const escaped = sorted.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');

  return text.split(regex).map((part, index) => ({
    text: part,
    highlight: index % 2 === 1,
  }));
}

export default function HighlightedText({ text, highlightWords }: Props) {
  const parts = splitWithHighlights(text, highlightWords);

  return (
    <p className="text-sm leading-relaxed text-gray-700">
      {parts.map((part, i) =>
        part.highlight ? (
          <mark
            key={i}
            className="rounded bg-yellow-200 px-0.5 text-yellow-900 not-italic"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  );
}
