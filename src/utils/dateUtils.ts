/**
 * 计算某聚会对应星期几的下一个或最近的日期（格式：YYYY-MM-DD）
 * @param targetWeekday 1 = Monday, 7 = Sunday
 * @param offsetWeeks 往后推几周（0 为当前或本周最近一次）
 */
export function getUpcomingServiceDate(targetWeekday: number, offsetWeeks = 0): string {
  const now = new Date();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // 1-7
  
  let daysUntil = targetWeekday - currentDay;
  if (daysUntil < 0) {
    daysUntil += 7;
  }
  
  const target = new Date(now);
  target.setDate(now.getDate() + daysUntil + offsetWeeks * 7);
  
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateLabel(dateStr: string, language: 'zh' | 'en' = 'zh'): string {
  if (!dateStr) return '';
  const [yyyy, mm, dd] = dateStr.split('-');
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const yearLabel = Number(yyyy) !== new Date().getFullYear() ? yyyy : '';
  if (language === 'en') {
    const monthDay = date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
    return `${monthDay}${yearLabel ? ` ${yearLabel}` : ''} (${date.toLocaleDateString('en-MY', { weekday: 'short' })})`;
  }
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const dayName = weekdays[date.getDay()];
  return `${yearLabel ? `${yearLabel}年` : ''}${Number(mm)}月${Number(dd)}日（星期${dayName}）`;
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const [yyyy, mm, dd] = dateStr.split('-');
  const yearLabel = Number(yyyy) !== new Date().getFullYear() ? `${yyyy}年` : '';
  return `${yearLabel}${Number(mm)}月${Number(dd)}日`;
}
