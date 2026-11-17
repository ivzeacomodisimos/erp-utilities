/** Current wall clock in the configured business timezone, independently of the browser's timezone. */
export function sequenceNow(timeZone = 'UTC', date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

export function sequenceRange(values, options) {
  const total = Number(values[options.totalField]);
  const start = Number(values[options.incrementField]);
  const max = options.maxValue || Number.MAX_SAFE_INTEGER;
  const end = options.totalIsLastNumber ? total : start + total - 1;
  return Number.isSafeInteger(total) && total > 0 && Number.isSafeInteger(start)
    && start > 0 && end >= start && end <= max ? { total, start, end } : null;
}
