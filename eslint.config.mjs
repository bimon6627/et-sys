import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
// import { defineConfig } from "eslint/config"; // Note: 'defineConfig' isn't standard in all versions yet, usually safe to export array directly

export default [
  // 1. Apply base JS recommended rules
  js.configs.recommended,

  // 2. Apply TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,

  // 3. Apply React recommended rules
  pluginReact.configs.flat.recommended,

  // 4. Main configuration object
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: {
      react: pluginReact,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        // Ensure these point to your actual tsconfig location
        // project: ["./tsconfig.json"],
        // tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React Rules
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off", // Often good to disable in TS projects

      // 💡 DISABLE TYPESCRIPT STRICT RULES HERE
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
