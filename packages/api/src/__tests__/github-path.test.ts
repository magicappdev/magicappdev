import { normalizePath, sanitizePath } from "../routes/github.js";
import { describe, expect, it } from "vitest";

describe("normalizePath", () => {
  it("resolves double-dot segments", () => {
    expect(normalizePath("a/b/../c")).toBe("a/c");
    expect(normalizePath("foo/bar/../../baz")).toBe("baz");
  });

  it("strips current-directory and empty segments", () => {
    expect(normalizePath("a//b/./c")).toBe("a/b/c");
    expect(normalizePath("./foo/./bar")).toBe("foo/bar");
  });

  it("collapses excess parent traversal to empty path", () => {
    expect(normalizePath("../../etc/passwd")).toBe("etc/passwd");
    expect(normalizePath("..")).toBe("");
  });

  it("preserves clean paths", () => {
    expect(normalizePath("src/components/Button.tsx")).toBe(
      "src/components/Button.tsx",
    );
    expect(normalizePath("single")).toBe("single");
  });
});

describe("sanitizePath", () => {
  it("accepts clean repo-relative paths", () => {
    expect(sanitizePath("src/components/Button.tsx")).toBe(
      "src/components/Button.tsx",
    );
    expect(sanitizePath("README.md")).toBe("README.md");
  });

  it("normalizes backslashes to forward slashes", () => {
    expect(sanitizePath("src\\utils\\helper.ts")).toBe("src/utils/helper.ts");
  });

  it("collapses empty and dot segments", () => {
    expect(sanitizePath("a//b/./c")).toBe("a/b/c");
  });

  it("normalizes absolute and traversal paths rather than rejecting them", () => {
    // normalizePath strips the leading empty segment from absolute paths
    expect(sanitizePath("/etc/passwd")).toBe("etc/passwd");
    // excess parent segments collapse to the remaining path
    expect(sanitizePath("../../etc/passwd")).toBe("etc/passwd");
    expect(sanitizePath("foo/../../bar")).toBe("bar");
  });
});
