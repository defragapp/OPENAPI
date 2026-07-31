export type HistoricalCivilTimeResolution =
  | {
      status: 'unique';
      instant: Date;
      offsetMinutes: number;
    }
  | {
      status: 'ambiguous';
      candidates: Array<{ instant: Date; offsetMinutes: number }>;
    }
  | {
      status: 'nonexistent';
    };

interface CivilParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function resolveHistoricalCivilTime(
  date: string,
  time: string,
  timezone: string
): HistoricalCivilTimeResolution {
  const desired = parseCivilParts(date, time);
  const formatter = timezoneFormatter(timezone);
  const desiredEpoch = Date.UTC(
    desired.year,
    desired.month - 1,
    desired.day,
    desired.hour,
    desired.minute,
    desired.second
  );

  const offsets = new Set<number>();
  for (let hourDelta = -36; hourDelta <= 36; hourDelta += 1) {
    const sample = new Date(desiredEpoch + hourDelta * 60 * 60 * 1000);
    const represented = formatCivilParts(formatter, sample);
    offsets.add(civilEpoch(represented) - sample.getTime());
  }

  const candidates = [...offsets].flatMap((offsetMilliseconds) => {
    const instant = new Date(desiredEpoch - offsetMilliseconds);
    const represented = formatCivilParts(formatter, instant);
    if (!sameCivilParts(desired, represented)) return [];
    return [{
      instant,
      offsetMinutes: Math.trunc(offsetMilliseconds / 60_000)
    }];
  });

  const unique = [...new Map(
    candidates.map((candidate) => [candidate.instant.getTime(), candidate])
  ).values()].sort((left, right) => left.instant.getTime() - right.instant.getTime());

  if (!unique.length) return { status: 'nonexistent' };
  if (unique.length > 1) return { status: 'ambiguous', candidates: unique };
  return { status: 'unique', instant: unique[0]!.instant, offsetMinutes: unique[0]!.offsetMinutes };
}

export function requireUniqueHistoricalCivilTime(date: string, time: string, timezone: string): Date {
  const resolution = resolveHistoricalCivilTime(date, time, timezone);
  if (resolution.status === 'nonexistent') throw new Error('baseline_birth_time_nonexistent');
  if (resolution.status === 'ambiguous') throw new Error('baseline_birth_time_ambiguous');
  return resolution.instant;
}

function parseCivilParts(date: string, time: string): CivilParts {
  const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!dateMatch || !timeMatch) throw new Error('baseline_birth_civil_time_invalid');
  const parts: CivilParts = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
    second: 0
  };
  const roundTrip = new Date(civilEpoch(parts));
  if (
    roundTrip.getUTCFullYear() !== parts.year
    || roundTrip.getUTCMonth() + 1 !== parts.month
    || roundTrip.getUTCDate() !== parts.day
  ) {
    throw new Error('baseline_birth_civil_time_invalid');
  }
  return parts;
}

function timezoneFormatter(timezone: string): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    });
  } catch {
    throw new Error('baseline_birth_timezone_invalid');
  }
}

function formatCivilParts(formatter: Intl.DateTimeFormat, instant: Date): CivilParts {
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map((part) => [part.type, part.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second)
  };
}

function civilEpoch(parts: CivilParts): number {
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

function sameCivilParts(left: CivilParts, right: CivilParts): boolean {
  return left.year === right.year
    && left.month === right.month
    && left.day === right.day
    && left.hour === right.hour
    && left.minute === right.minute
    && left.second === right.second;
}
