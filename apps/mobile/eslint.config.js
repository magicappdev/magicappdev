import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
    ignores: [
      "dist/*",
      ".expo/*",
      "src/components/**/*",
      "src/app/explore.tsx",
      "scripts/**/*",
      "eslint.config.js",
    ],
  },
];
