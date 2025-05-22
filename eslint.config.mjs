import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 1. Apply base JS recommended rules (from @eslint/js)
  js.configs.recommended,

  // 2. Apply TypeScript ESLint recommended rules
  // tseslint.configs.recommended returns an array, so spread it.
  ...tseslint.configs.recommended,

  // 3. Apply React recommended rules from eslint-plugin-react
  // Based on your error, `pluginReact.configs.flat.recommended` is likely a single object.
  // DO NOT spread it here. Just include it directly.
  pluginReact.configs.flat.recommended,

  // 4. Main configuration object for all your JS/TS/JSX/TSX files
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: {
      // Explicitly declare the react plugin so its rules can be referenced
      react: pluginReact,
      // If you're using the Next.js ESLint plugin, you'd import and declare it here too:
      // next: nextPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser, // Include browser globals (e.g., window, document)
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing for both .jsx and .tsx files
        },
        // These are crucial for TypeScript type-aware linting
        project: ["./tsconfig.json"], // Path to your tsconfig.json relative to eslint.config.mjs
        tsconfigRootDir: import.meta.dirname, // Helps ESLint resolve the project path correctly
      },
    },
    settings: {
      // This tells eslint-plugin-react what version of React to use for its checks
      react: {
        version: "detect", // Automatically detect React version from your package.json
      },
    },
    rules: {
      // Disable the rules that require 'import React from "react";'
      // These are not needed in React 17+ with the new JSX transform used by Next.js
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off", // Related rule, also good to turn off

      // Add any other custom rules or overrides here
      // For example, if you want to ensure prop-types aren't used:
      // "react/prop-types": "off",
      // Or enable specific rules for hooks:
      // "react-hooks/exhaustive-deps": "warn",
      // "react-hooks/rules-of-hooks": "error",
    },
  },

  // If you were manually including Next.js recommended rules (e.g., from "@next/eslint-plugin-next"),
  // you would add them as additional configuration objects here.
  // For example:
  // nextPlugin.configs.recommended, // If 'nextPlugin' was imported above
]);
