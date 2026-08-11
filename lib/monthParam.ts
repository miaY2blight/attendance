export function parseYearMonth(searchValue: string | undefined): { year: number; month: number } {
  const now = new Date();
  if (searchValue && /^\d{4}-\d{2}$/.test(searchValue)) {
    const [year, month] = searchValue.split("-").map(Number);
    return { year, month };
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function shiftMonth(year: number, month: number, delta: number): string {
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}
