#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { Command } from "commander";
import { scan, mirrorPlan } from "./compare.js";
import { orderSteps, type Step } from "./pipeline.js";

const program = new Command();

program
  .name("tashayun")
  .description("Encrypted folder sync and backup across local disks, SSH and S3")
  .version("0.0.1");

program
  .command("plan")
  .description("Preview a mirror sync from SOURCE to DEST without changing anything")
  .argument("<source>", "source folder")
  .argument("<dest>", "destination folder")
  .action((source: string, dest: string) => {
    try {
      const plan = mirrorPlan(scan(source), scan(dest));
      console.log(`copy:   ${plan.copy.length}`);
      console.log(`update: ${plan.update.length}`);
      console.log(`delete: ${plan.delete.length}`);
      console.log(`same:   ${plan.same.length}`);
      for (const p of plan.copy) console.log(`  + ${p}`);
      for (const p of plan.update) console.log(`  ~ ${p}`);
      for (const p of plan.delete) console.log(`  - ${p}`);
      console.log("\nDry run only. Nothing was changed.");
    } catch (e) {
      console.error(`Error: ${(e as Error).message}`);
      process.exitCode = 1;
    }
  });

program
  .command("pipeline")
  .description("Check a pipeline file and show the order its steps would run in (dry run)")
  .argument("<file>", "pipeline JSON file")
  .action((file: string) => {
    try {
      const data = JSON.parse(readFileSync(file, "utf8")) as { steps?: Step[] };
      if (!Array.isArray(data.steps)) throw new Error('Pipeline file must have a "steps" list');
      const order = orderSteps(data.steps);
      const byId = new Map(data.steps.map((s) => [s.id, s]));
      order.forEach((id, i) => console.log(`${i + 1}. ${id} (${byId.get(id)?.type})`));
      console.log("\nDry run only. Nothing was run.");
    } catch (e) {
      console.error(`Error: ${(e as Error).message}`);
      process.exitCode = 1;
    }
  });

program.parse();
