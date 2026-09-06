import {
  safeGlobToRegExp,
  validateProjectFilePath,
} from "../lib/agent-utils.js";
import { describe, expect, it } from "vitest";

describe("safeGlobToRegExp", () => {
  it("matches literal paths exactly", () => {
    const re = safeGlobToRegExp("src/app.ts");
    expect(re.test("src/app.ts")).toBe(true);
    expect(re.test("src/app.ts.bak")).toBe(false);
    expect(re.test("xsrc/app.ts")).toBe(false);
  });

  it("treats * as match-anything including slashes", () => {
    const re = safeGlobToRegExp("src/*.ts");
    expect(re.test("src/app.ts")).toBe(true);
    expect(re.test("src/nested/app.ts")).toBe(true);
    expect(re.test("lib/app.ts")).toBe(false);
  });

  it("treats ? as a single character", () => {
    const re = safeGlobToRegExp("src/app.?s");
    expect(re.test("src/app.ts")).toBe(true);
    expect(re.test("src/app.tss")).toBe(false);
  });

  it("escapes regex metacharacters", () => {
    const re = safeGlobToRegExp("src/app.(ts|js)");
    expect(re.test("src/app.ts")).toBe(false);
    expect(re.test("src/app.(ts|js)")).toBe(true);
  });
});

describe("validateProjectFilePath", () => {
  it("accepts plain relative paths", () => {
    expect(() =>
      validateProjectFilePath("src/components/Button.tsx"),
    ).not.toThrow();
  });

  it("rejects empty paths", () => {
    expect(() => validateProjectFilePath("")).toThrow(
      "File path must be a non-empty string",
    );
  });

  it("rejects absolute paths", () => {
    expect(() => validateProjectFilePath("/etc/passwd")).toThrow(
      "File path must be relative",
    );
  });

  it("rejects Windows absolute paths", () => {
    expect(() => validateProjectFilePath("C:\\evil\\file.ts")).toThrow(
      "File path must be relative",
    );
  });

  it("rejects parent directory traversal", () => {
    expect(() => validateProjectFilePath("../outside.ts")).toThrow(
      "must not contain parent directory references",
    );
    expect(() => validateProjectFilePath("src/../../outside.ts")).toThrow(
      "must not contain parent directory references",
    );
  });

  it("rejects null bytes", () => {
    expect(() => validateProjectFilePath("src/a\0b.ts")).toThrow(
      "must not contain null bytes",
    );
  });
});
