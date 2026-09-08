const JAKARTA_TIMEZONE = 'Asia/Jakarta';
const JAKARTA_OFFSET_MINUTES = 7 * 60;

function getDateParts(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error('Tanggal tidak valid');
  }

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

export function getJakartaNowParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: JAKARTA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map(({ type, value }) => [type, value])
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month) - 1,
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

export function getJakartaDateTime(date, time) {
  const { year, month, day } = getDateParts(date);
  const [hour, minute] = String(time || '').split(':').map(Number);

  if (![hour, minute].every(Number.isInteger) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error('Waktu kajian tidak valid');
  }

  return new Date(Date.UTC(year, month, day, hour, minute) - JAKARTA_OFFSET_MINUTES * 60 * 1000);
}

export function getJakartaDateString(date) {
  const { year, month, day } = getDateParts(date);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}