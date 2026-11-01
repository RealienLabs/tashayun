import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mirrorPlan, scan, type FileInfo } from "../src/compare.js";

const f = (size: number, mtimeMs: number): FileInfo => ({ size, mtimeMs });

describe("mirrorPlan", () => {
  it("copies files missing from the destination", () => {
    const plan = mirrorPlan(new Map([["a.txt", f(1, 1)]]), new Map());
    expect(plan.copy).toEqual(["a.txt"]);
  });

  it("updates files that differ in size or are older at the destination", () => {
    const src = new Map([["a", f(2, 5)], ["b", f(1, 9)]]);
    const dst = new Map([["a", f(1, 5)], ["b", f(1, 3)]]);
    expect(mirrorPlan(src, dst).update).toEqual(["a", "b"]);
  });

  it("deletes files that exist only at the destination", () => {
    const plan = mirrorPlan(new Map(), new Map([["old.txt", f(1, 1)]]));
    expect(plan.delete).toEqual(["old.txt"]);
  });

  it("leaves identical files alone", () => {
    const plan = mirrorPlan(new Map([["a", f(1, 5)]]), new Map([["a", f(1, 5)]]));
    expect(plan.same).toEqual(["a"]);
    expect(plan.copy.length + plan.update.length + plan.delete.length).toBe(0);
  });
});

describe("scan", () => {
  it("lists files recursively with relative paths", () => {
    const dir = mkdtempSync(join(tmpdir(), "tashayun-"));
    try {
      mkdirSync(join(dir, "sub"));
      writeFileSync(join(dir, "a.txt"), "hello");
      writeFileSync(join(dir, "sub", "b.txt"), "hi");
      const result = scan(dir);
      expect([...result.keys()].sort()).toEqual(["a.txt", join("sub", "b.txt")]);
      expect(result.get("a.txt")?.size).toBe(5);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws a clear error for a missing folder", () => {
    expect(() => scan("/definitely/not/a/real/folder")).toThrow("Folder not found");
  });
});
