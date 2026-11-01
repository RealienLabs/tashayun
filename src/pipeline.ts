export type Step = { id: string; type: string; after?: string[]; [key: string]: unknown };

// Returns step ids in an order where every step comes after the steps it depends on.
export function orderSteps(steps: Step[]): string[] {
  const ids = new Set(steps.map((s) => s.id));
  if (ids.size !== steps.length) throw new Error("Duplicate step id");
  for (const s of steps) {
    for (const dep of s.after ?? []) {
      if (!ids.has(dep)) throw new Error(`Step "${s.id}" runs after unknown step "${dep}"`);
    }
  }
  const done = new Set<string>();
  const order: string[] = [];
  let remaining = [...steps];
  while (remaining.length > 0) {
    const ready = remaining.filter((s) => (s.after ?? []).every((d) => done.has(d)));
    if (ready.length === 0) throw new Error("Cycle detected in pipeline steps");
    for (const s of ready) {
      order.push(s.id);
      done.add(s.id);
    }
    remaining = remaining.filter((s) => !done.has(s.id));
  }
  return order;
}
