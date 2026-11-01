import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

export type FileInfo = { size: number; mtimeMs: number };
export type Plan = { copy: string[]; update: string[]; delete: string[]; same: string[] };

export function scan(root: string): Map<string, FileInfo> {
  if (!existsSync(root)) throw new Error(`Folder not found: ${root}`);
  const out = new Map<string, FileInfo>();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const s = statSync(full);
        out.set(relative(root, full), { size: s.size, mtimeMs: s.mtimeMs });
      }
    }
  };
  walk(root);
  return out;
}

// Mirror mode: make the destination match the source.
export function mirrorPlan(src: Map<string, FileInfo>, dst: Map<string, FileInfo>): Plan {
  const plan: Plan = { copy: [], update: [], delete: [], same: [] };
  for (const [path, s] of src) {
    const d = dst.get(path);
    if (!d) plan.copy.push(path);
    else if (d.size !== s.size || d.mtimeMs < s.mtimeMs) plan.update.push(path);
    else plan.same.push(path);
  }
  for (const path of dst.keys()) {
    if (!src.has(path)) plan.delete.push(path);
  }
  for (const list of Object.values(plan)) list.sort();
  return plan;
}
