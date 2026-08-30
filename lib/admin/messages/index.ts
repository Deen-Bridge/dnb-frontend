export * as team from "./team";
export * as audit from "./audit";
export * as settings from "./settings";
export * as common from "./common";

export function interpolate(template?: string, values: Record<string, string | number | undefined> = {}): string {
  if (!template || typeof template !== "string") return template || "";

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return value !== undefined ? String(value) : match;
  });
}

export function createMessage(template: string): (values?: Record<string, string | number | undefined>) => string {
  return (values = {}) => interpolate(template, values);
}
