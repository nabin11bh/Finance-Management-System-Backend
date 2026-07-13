export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfWeek(): Date {
  const d = startOfToday();
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  return d;
}

export function startOfMonth(): Date {
  const d = startOfToday();
  d.setDate(1);
  return d;
}

export function startOfYear(): Date {
  const d = startOfToday();
  d.setMonth(0, 1);
  return d;
}

export function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export interface DateRange {
  gte: Date;
  lte: Date;
}

export function rangeFrom(start: Date): DateRange {
  return { gte: start, lte: endOfToday() };
}