module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: "detect" } },
  ignorePatterns: ["build", "node_modules"],
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    // The template relies on runtime prop-types rather than static typing, and
    // React 19 ignores them anyway; don't fail the lint over missing declarations.
    "react/prop-types": "off",
    // Pre-existing template patterns: the MD* components are anonymous forwardRef
    // wrappers, and a couple of dialogs autofocus on open. Surfaced, not blocking.
    "react/display-name": "warn",
    "jsx-a11y/no-autofocus": "warn",
  },
};
