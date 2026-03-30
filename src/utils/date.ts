export type Weekday = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
export type Week<T> = Partial<Record<Weekday, T>>;
export type Month<T> = { month: number; weeks: Week<T>[]; }; // month: 0-11
export type Year<T> = { year: number; months: Month<T>[]; };
export type Calendar<T> = Year<T>[];

export function buildCalendar<T extends { date: Date; }>(items: T[]): Calendar<T> {
  if (items.length === 0) return [];

  const weekdayOf = (date: Date): Weekday =>
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getUTCDay()] as Weekday;

  const ymdNum = (date: Date, addDays: number = 0): number =>
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + addDays);

  const ymdDate = (date: Date, addDays: number): Date =>
    new Date(ymdNum(date, addDays));

  // assume items are unique at granularity of day;
  const sorted = [...items].sort((a, b) => ymdNum(a.date) - ymdNum(b.date));
  const endKey = ymdNum(sorted[sorted.length - 1].date);

  let currentYear: Year<T> | undefined;
  let currentMonth: Month<T> | undefined;
  let currentWeek: Week<T> | undefined;

  let i = 0;
  let currentDate = ymdDate(sorted[0].date, 0);

  const cal: Calendar<T> = [];

  while (ymdNum(currentDate) <= endKey) {
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();
    const weekday = weekdayOf(currentDate);
    const currentKey = ymdNum(currentDate);

    if (!currentYear || currentYear.year !== year) {
      currentYear = { year, months: [] };
      cal.push(currentYear);
      currentMonth = undefined;
      currentWeek = undefined;
    }

    if (!currentMonth || currentMonth.month !== month) {
      currentMonth = { month, weeks: [] };
      currentYear.months.push(currentMonth);
      currentWeek = undefined;
    }

    if (!currentWeek || weekday === 'Sun') {
      currentWeek = {};
      currentMonth.weeks.push(currentWeek);
    }

    const entry = sorted[i] as T | undefined;
    if (entry && ymdNum(entry.date) === currentKey) {
      currentWeek[weekday] = entry;
      i++;
    }

    currentDate = ymdDate(currentDate, 1);
  }

  return cal;
}
