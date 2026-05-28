import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import astro from "eslint-plugin-astro";
import svelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      ".astro/**",
      ".wrangler/**",
      ".vercel/**",
      ".yarn/**",
      "node_modules/**",
      "worker-configuration.d.ts",
      "legacy/**",
      "design/**",
      "public/**",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  {
    files: ["**/*.{jsx,tsx}"],
    ...react.configs.flat.recommended,
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },

  ...astro.configs.recommended,
  ...svelte.configs["flat/recommended"],

  prettier,
];
