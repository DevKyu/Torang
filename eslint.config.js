import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: ["dist", "node_modules"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json", // 타입스크립트 프로젝트 설정 (필요 시)
      },
      globals: js.configs.recommended.languageOptions.globals,
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@typescript-eslint": ts,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...ts.configs.recommended.rules,

      // React 17 이상부터는 import React 생략 가능
      "react/react-in-jsx-scope": "off",

      // React Hooks 규칙 강화
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    extends: [
      prettierConfig, // Prettier 규칙 덮어쓰기 (마지막에 위치)
    ],
  },
];
