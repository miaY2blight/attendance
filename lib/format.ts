export function formatTime(date: Date | null | undefined): string {
  if (!date) return "--:--";
  return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDateWithWeekday(date: Date): string {
  return `${formatDate(date)}(${WEEKDAYS[date.getDay()]})`;
}
