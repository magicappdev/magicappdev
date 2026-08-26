import expoConfig from "eslint-config-expo/flat.js";

export default [
  ...(Array.isArray(expoConfig) ? expoConfig : [expoConfig]),
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
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
