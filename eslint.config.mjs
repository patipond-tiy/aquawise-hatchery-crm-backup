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
];

export default config;
