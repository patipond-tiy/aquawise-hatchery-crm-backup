import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      ".claude/**",
      "node_modules/**",
      "prototypes/**",
      "lib/database.types.ts",
    ],
  },
  ...nextCoreWebVitals,
  {
    // react-hooks v6 introduced stricter rules (immutability, set-state-in-effect,
    // pure-function) that flag valid patterns in this codebase. Downgraded to warn
    // so the lint gate catches new regressions without blocking on existing code.
    // Correctness rules (react-hooks/rules-of-hooks, react-hooks/exhaustive-deps)
    // remain at their default error level from eslint-config-next.
    rules: {
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // Story S9 — shift §18 anti-pattern enforcement left (lint-time, not
    // review-time). All three are syntactic `no-restricted-syntax` selectors
    // + the built-in react/no-danger; no custom plugin needed. Relies on S6
    // (role-string → can()) having landed, so the codebase passes clean.
    rules: {
      // §18 — never render raw HTML (XSS). React escapes by default.
      "react/no-danger": "error",
      "no-restricted-syntax": [
        "error",
        {
          // §18(C) — getSession() does not validate the JWT. Authorization
          // decisions must use getUser() (verifies server-side).
          selector:
            "CallExpression[callee.property.name='getSession']",
          message:
            "Do not call supabase.auth.getSession() for authorization. Use getUser() — it validates the JWT server-side. See code-design.md §18(C) and security.md §9.",
        },
        {
          // §18(B) — no role-string branching; use can(role, action).
          // Matches `<x>.role === 'owner'` / `!==` for any of the 4 roles
          // (either operand order). NOTE: `left ~ right` is NOT a valid
          // ESQuery relationship inside a BinaryExpression (the sibling
          // combinator does not bridge the left/right child slots), so the
          // previous selector silently matched nothing. `:has(...):has(...)`
          // is the correct form — it fires whenever the comparison touches a
          // `.role` member and a role-name literal in either operand order.
          selector:
            "BinaryExpression[operator=/^(===|!==)$/]:has(MemberExpression[property.name='role']):has(Literal[value=/^(owner|counter_staff|lab_tech|auditor)$/])",
          message:
            "Do not branch on role strings. Use can(role, action) from lib/rbac. See code-design.md §9 and §18(B).",
        },
      ],
    },
  },
  {
    // Forward-compatibility guard: the auth cookie-refresh middleware is the
    // single sanctioned place a getSession() call could legitimately live
    // (it currently uses getUser()). Suppress the getSession ban here so the
    // file is not blanket-disabled in future. (S9 Task 4)
    files: ["lib/supabase/middleware.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    // lib/rbac.ts IS the RBAC matrix — role literals are the source of
    // truth here, not an anti-pattern. (S9 Task 4)
    files: ["lib/rbac.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
];

export default config;
