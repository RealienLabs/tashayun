import { describe, it, expect } from "vitest";
import { orderSteps, type Step } from "../src/pipeline.js";

const step = (id: string, after?: string[]): Step => ({ id, type: "mirror", after });

describe("orderSteps", () => {
  it("runs a step only after the steps it depends on", () => {
    const order = orderSteps([step("c", ["b"]), step("b", ["a"]), step("a")]);
    expect(order).toEqual(["a", "b", "c"]);
  });

  it("keeps the given order for independent steps", () => {
    expect(orderSteps([step("x"), step("y"), step("z")])).toEqual(["x", "y", "z"]);
  });

  it("rejects a step that runs after an unknown step", () => {
    expect(() => orderSteps([step("a", ["missing"])])).toThrow("unknown step");
  });

  it("rejects a cycle", () => {
    expect(() => orderSteps([step("a", ["b"]), step("b", ["a"])])).toThrow("Cycle");
  });

  it("rejects duplicate step ids", () => {
    expect(() => orderSteps([step("a"), step("a")])).toThrow("Duplicate");
  });
});
