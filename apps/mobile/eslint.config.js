import expoConfig from "eslint-config-expo/flat";

export default [
  expoConfig,
  {
    ignores: [
      "dist/*",
      ".expo/*",
      "src/components/**/*",
      "src/app/explore.tsx",
      "scripts/**/*",
      "metro.config.js",
      "eslint.config.js",
    ],
  },
];
