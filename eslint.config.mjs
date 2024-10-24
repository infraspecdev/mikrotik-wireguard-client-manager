import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {ignores: ["node_modules", "dist", "build"]},
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "eol-last": "error",
      "eqeqeq": ["error", "allow-null"],
      "indent": ["error", 2, { "MemberExpression": "off", "SwitchCase": 1 }],
      "no-trailing-spaces": "error",
      "no-unused-vars": ["error", { "vars": "all", "args": "none", "ignoreRestSiblings": true }]
    }
  }
];
