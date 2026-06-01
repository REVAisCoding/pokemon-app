export function parseSetTotalFromNumber(number: string): number | undefined {
  const match = number.match(/\/(\d+)\s*$/);

  if (!match) {
    return undefined;
  }

  const total = Number.parseInt(match[1], 10);

  return Number.isNaN(total) ? undefined : total;
}
