export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const result = y + "-" + m + "-" + d;
  return result;
}

export function today(): string {
  return formatDate(new Date());
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export function getYearRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end };
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return minutes + "分钟";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m > 0) return h + "小时" + m + "分钟";
  return h + "小时";
}

export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  return formatDate(d) + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getCalendarGrid(year: number, month: number): Array<{ day: number; month: number; year: number; isCurrentMonth: boolean }> {
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const prevMonth = month - 1 < 0 ? 11 : month - 1;
  const prevYear = month - 1 < 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  const grid: Array<{ day: number; month: number; year: number; isCurrentMonth: boolean }> = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    grid.push({ day: daysInPrevMonth - i, month: prevMonth, year: prevYear, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({ day: d, month, year, isCurrentMonth: true });
  }
  const nextMonth = month + 1 > 11 ? 0 : month + 1;
  const nextYear = month + 1 > 11 ? year + 1 : year;
  let remaining = 42 - grid.length;
  for (let d = 1; d <= remaining; d++) {
    grid.push({ day: d, month: nextMonth, year: nextYear, isCurrentMonth: false });
  }
  return grid;
}

export function toDateString(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return year + "-" + m + "-" + d;
}

export function formatTimeDisplay(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return pad(h) + ":" + pad(m) + ":" + pad(s);
  return pad(m) + ":" + pad(s);
}
