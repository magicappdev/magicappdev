module.exports = {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"],
  // Run typecheck for all files if any TS file changes
  // Using a function to ignore the passed filenames because typecheck needs the whole project
  "**/*.ts?(x)": () => "pnpm typecheck",
};
