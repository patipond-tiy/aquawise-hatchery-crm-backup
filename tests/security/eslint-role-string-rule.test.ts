import { describe, expect, it } from 'vitest';
import { Linter } from 'eslint';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// UAT S9c regression — the §18(B) "no role-string branching" lint rule was
// shipped with a selector that used the ESQuery sibling combinator
// (`BinaryExpression > MemberExpression ~ Literal`). Inside a
// BinaryExpression the `left`/`right` slots are NOT siblings, so the selector
// matched NOTHING — `pnpm lint` never failed on `x.role === 'owner'`,
// silently defeating the security control. The fix uses the
// `:has(...):has(...)` form. This test pins the rule so a future edit that
// reverts to a non-firing selector fails CI.

function roleStringSelector(): string {
  // Extract the live selector from eslint.config.mjs so the test tracks the
  // real config, not a copy.
  const cfg = readFileSync(
    path.join(process.cwd(), 'eslint.config.mjs'),
    'utf8'
  );
  const m = cfg.match(
    /selector:\s*\n?\s*"(BinaryExpression\[operator[^"]*role[^"]*)"/
  );
  if (!m) throw new Error('role-string no-restricted-syntax selector not found in eslint.config.mjs');
  return m[1];
}

function lintWith(selector: string, code: string) {
  const linter = new Linter();
  return linter.verify(code, {
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector, message: 'role-string' },
      ],
    },
  });
}

describe('S9c — role-string equality lint rule actually fires', () => {
  const selector = roleStringSelector();

  it('flags `x.role === \'owner\'` (member on the left)', () => {
    const msgs = lintWith(selector, "function f(u){ return u.role === 'owner'; }");
    expect(msgs.length).toBe(1);
  });

  it('flags `\'lab_tech\' === r.role` (member on the right)', () => {
    const msgs = lintWith(selector, "function f(r){ return 'lab_tech' === r.role; }");
    expect(msgs.length).toBe(1);
  });

  it('flags `!==` against a role literal', () => {
    const msgs = lintWith(selector, "function f(u){ return u.role !== 'auditor'; }");
    expect(msgs.length).toBe(1);
  });

  it('does NOT flag a non-role string comparison', () => {
    const msgs = lintWith(selector, "function f(u){ return u.name === 'owner'; }");
    expect(msgs.length).toBe(0);
  });

  it('does NOT flag a role comparison to a non-role literal', () => {
    const msgs = lintWith(selector, "function f(u){ return u.role === 'superadmin'; }");
    expect(msgs.length).toBe(0);
  });
});
