export const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export const formatTime = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
export const validDate = (date: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) &&
  new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;
export const zonedNow = (zone: string, now = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const part = (name: string) => parts.find((p) => p.type === name)!.value;
  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    minute: Number(part('hour')) * 60 + Number(part('minute')),
  };
};
export const overlaps = (start: string, end: string, otherStart: string, otherEnd: string) =>
  minutes(start) < minutes(otherEnd) && minutes(end) > minutes(otherStart);
export const canClientChange = (
  date: string,
  start: string,
  hours: number,
  zone: string,
  now = new Date(),
) => {
  const instant = wallTimeInstant(date, start, zone);
  return instant !== null && instant - now.getTime() > hours * 3600000;
};

// Resolve a local calendar time to an instant. Nonexistent DST times return null.
export const wallTimeInstant = (date: string, time: string, zone: string): number | null => {
  const target = Date.parse(`${date}T${time}:00Z`);
  let instant = target;
  for (let attempt = 0; attempt < 4; attempt++) {
    const observed = zonedNow(zone, new Date(instant));
    const localEpoch = Date.parse(`${observed.date}T00:00:00Z`) + observed.minute * 60000;
    const correction = target - localEpoch;
    if (correction === 0) return instant;
    instant += correction;
  }
  return null;
};
