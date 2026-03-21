const IGNORED_DIRS = [
  ".agent/",
  ".agents/",
  ".kilo/",
  ".kilocode/",
  ".claude/",
  ".gemini/",
  "agents/",
  "docs/skills/",
];

const filterIgnored = files =>
  files.filter(
    f => !IGNORED_DIRS.some(dir => f.replace(/\\/g, "/").includes(dir)),
  );

module.exports = {
  "*.{ts,tsx}": files => {
    const filtered = filterIgnored(files);
    if (!filtered.length) return [];
    return [
      `eslint --fix ${filtered.join(" ")}`,
      `prettier --write ${filtered.join(" ")}`,
    ];
  },
  "*.{js,jsx}": files => {
    const filtered = filterIgnored(files);
    if (!filtered.length) return [];
    return [
      `eslint --fix ${filtered.join(" ")}`,
      `prettier --write ${filtered.join(" ")}`,
    ];
  },
  "*.{json,md}": files => {
    const filtered = filterIgnored(files);
    if (!filtered.length) return [];
    return [`prettier --write ${filtered.join(" ")}`];
  },
  // Run typecheck for all files if any TS file changes
  // Using a function to ignore the passed filenames because typecheck needs the whole project
  "**/*.ts?(x)": () => "pnpm typecheck",
};
