import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";

/**
 * Flat config wired directly to the Next.js plugin + the TypeScript parser.
 * We avoid FlatCompat + eslint-config-next because that combo throws a
 * circular-structure error with ESLint 9 here. This gives a working lint that
 * catches the real Next issues (img, links, scripts, fonts) and parses TS/JSX;
 * the full @typescript-eslint ruleset is intentionally left off to avoid
 * flooding an existing codebase with style-level errors.
 */
const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "eslint.config.mjs"] },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,mts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
    },
    plugins: { "@next/next": nextPlugin, "react-hooks": reactHooks },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // The two classic, high-value hooks rules. We deliberately skip this
      // plugin version's newer "recommended" rules (e.g. set-state-in-effect),
      // which flag legitimate SSR-safe mount-time init as errors.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
