export function helper1(a: number, b: number): number {
  if (a > b) return a + b;
  if (a === b) return a * 2;
  return b - a;
}

export function helper2(input: string): string {
  const trimmed = input.trim();
  if (trimmed.length === 0) return "empty";
  if (trimmed.length > 100) return trimmed.substring(0, 100);
  return trimmed.toLowerCase();
}

export function helper3(items: number[]): { sum: number; avg: number; max: number; min: number } {
  if (items.length === 0) return { sum: 0, avg: 0, max: 0, min: 0 };
  const sum = items.reduce((a, b) => a + b, 0);
  return {
    sum,
    avg: sum / items.length,
    max: Math.max(...items),
    min: Math.min(...items),
  };
}

export function helper4(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

export function helper5(obj: Record<string, unknown>, key: string): unknown {
  const keys = key.split(".");
  let current: unknown = obj;
  for (const k of keys) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[k];
  }
  return current;
}

export function helper6(arr: unknown[], predicate: (item: unknown) => boolean): unknown[] {
  const results: unknown[] = [];
  for (const item of arr) {
    if (predicate(item)) results.push(item);
  }
  return results;
}

export function helper7(n: number): string {
  if (n < 0) return "negative";
  if (n === 0) return "zero";
  if (n % 2 === 0) return "even";
  return "odd";
}

export function helper8(config: { enabled?: boolean; timeout?: number; retries?: number }): string {
  const parts: string[] = [];
  if (config.enabled) parts.push("enabled");
  if (config.timeout && config.timeout > 5000) parts.push("slow-timeout");
  if (config.retries && config.retries > 3) parts.push("many-retries");
  return parts.join(",") || "default";
}

export function helper9(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function helper10(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  const result: number[][] = [];
  for (let j = 0; j < cols; j++) {
    result[j] = [];
    for (let i = 0; i < rows; i++) {
      result[j][i] = matrix[i][j];
    }
  }
  return result;
}
