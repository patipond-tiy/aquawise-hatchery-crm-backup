import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

// Conformance-gate §1 regression guard: the 404 surface is a professional
// surface and must carry NO emoji (it previously shipped a 🐚 literal).
// It must render an inline SVG glyph instead, with the Thai not-found copy.

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, ...p }: { children: React.ReactNode }) => (
    <a {...p}>{children}</a>
  ),
}));

import NotFound from '@/app/[locale]/not-found';

// Matches any emoji / pictographic codepoint (incl. 🐚 U+1F41A).
const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}]/u;

describe('not-found page — conformance §1 (no emoji on a professional surface)', () => {
  it('renders the Thai not-found copy and an inline SVG, with zero emoji', () => {
    const { container } = render(<NotFound />);

    expect(container.textContent).toContain('ไม่พบหน้านี้');
    expect(container.textContent).toContain('กลับหน้าหลัก');

    // The decorative glyph is an inline SVG (stroke-based), not an emoji.
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute('fill')).toBe('none');

    // Hard assertion: no emoji codepoint anywhere in the rendered output.
    expect(EMOJI_RE.test(container.textContent ?? '')).toBe(false);
    expect(container.textContent).not.toContain('🐚');
  });
});
