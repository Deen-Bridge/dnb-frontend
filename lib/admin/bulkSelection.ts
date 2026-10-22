export function toggleSelection(selected: string[], id: string): string[] { return selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]; }
export function selectAll(ids: string[], selected: boolean): string[] { return selected ? [...ids] : []; }
