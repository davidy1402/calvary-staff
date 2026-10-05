interface DatedItem {
  roster: {
    date: string;
  };
}

const getDayOffset = (date: string, today: string): number => {
  const toUtcDay = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return Date.UTC(year, month - 1, day) / 86_400_000;
  };

  return toUtcDay(date) - toUtcDay(today);
};

export const getClosestDatedItems = <T extends DatedItem>(
  items: T[],
  today: string,
  limit = 2,
): T[] =>
  [...items]
    .sort((a, b) => {
      const aOffset = getDayOffset(a.roster.date, today);
      const bOffset = getDayOffset(b.roster.date, today);
      const distanceDifference = Math.abs(aOffset) - Math.abs(bOffset);

      if (distanceDifference !== 0) return distanceDifference;
      if ((aOffset >= 0) !== (bOffset >= 0)) return aOffset >= 0 ? -1 : 1;
      return a.roster.date.localeCompare(b.roster.date);
    })
    .slice(0, limit);
