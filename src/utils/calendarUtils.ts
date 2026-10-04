/**
 * Formats a Date object or date-time string into iCalendar UTC/Local format: YYYYMMDDTHHmmss
 */
function formatIcsDateTime(dateStr: string, timeStr?: string): { start: string; end: string } {
  // Typical dateStr: "2026-10-04"
  // Typical timeStr: "10:30 AM" or "9:30 AM 彩排调音"
  const [yyyy, mm, dd] = dateStr.split('-');
  const year = parseInt(yyyy, 10);
  const month = parseInt(mm, 10) - 1;
  const day = parseInt(dd, 10);

  let startHour = 9;
  let startMinute = 30;

  if (timeStr) {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let hour = parseInt(match[1], 10);
      const min = parseInt(match[2], 10);
      const isPM = match[3]?.toUpperCase() === 'PM';
      if (isPM && hour < 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      startHour = hour;
      startMinute = min;
    }
  }

  const startDate = new Date(year, month, day, startHour, startMinute, 0);
  // Default duration: 2.5 hours
  const endDate = new Date(startDate.getTime() + 2.5 * 60 * 60 * 1000);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const toIcsFormat = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  return {
    start: toIcsFormat(startDate),
    end: toIcsFormat(endDate),
  };
}

/**
 * Escape text for iCalendar fields
 */
function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export interface CalendarEventData {
  title: string;
  serviceName: string;
  rolesSummary: string;
  dateStr: string;
  rehearsalTime?: string;
  serviceVenue?: string;
  theme?: string;
  speaker?: string;
}

/**
 * Generates an .ics file content with 1-week and 1-day advance alarms.
 */
export function generateIcsContent(event: CalendarEventData): string {
  const { start, end } = formatIcsDateTime(event.dateStr, event.rehearsalTime);
  const uid = `${event.dateStr}-${Date.now()}@calvaryjb.org`;
  const now = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const nowStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const descriptionLines: string[] = [
    `【CCCJB 教会服事通知】`,
    `服事岗位：${event.rolesSummary}`,
    `聚会：${event.serviceName}`,
    `彩排时间：${event.rehearsalTime || '请留意群通知'}`,
    `聚会地点：${event.serviceVenue || '加略山社区教会'}`,
  ];

  if (event.theme) {
    descriptionLines.push(`讲道主题：${event.theme}`);
  }
  if (event.speaker) {
    descriptionLines.push(`讲员：${event.speaker}`);
  }

  descriptionLines.push(`\n提前一周及提前一天会收到手机提醒。感谢您的忠心服事！`);

  const escapedSummary = escapeIcsText(`【服事】${event.serviceName} - ${event.rolesSummary}`);
  const escapedDescription = escapeIcsText(descriptionLines.join('\n'));
  const escapedLocation = escapeIcsText(event.serviceVenue || '新山加略山社区教会');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CCCJB Connect//Staff Roster//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapedSummary}`,
    `DESCRIPTION:${escapedDescription}`,
    `LOCATION:${escapedLocation}`,
    'STATUS:CONFIRMED',
    // Alarm 1: 1 week before (7 days)
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:服事提前 1 周提醒：下周有教会服事',
    'TRIGGER:-P7D',
    'END:VALARM',
    // Alarm 2: 1 day before (24 hours)
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:服事提前 1 天提醒：明天主日服事，请预备心',
    'TRIGGER:-P1D',
    'END:VALARM',
    // Alarm 3: 2 hours before rehearsal
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:服事当天提醒：请准时到场彩排',
    'TRIGGER:-PT2H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers native .ics download or opens calendar handler.
 */
export function downloadCalendarEvent(event: CalendarEventData): void {
  const icsData = generateIcsContent(event);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const filename = `CCCJB-服事-${event.dateStr}.ics`;

  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Creates Google Calendar web URL as an alternative fallback.
 */
export function getGoogleCalendarUrl(event: CalendarEventData): string {
  const { start, end } = formatIcsDateTime(event.dateStr, event.rehearsalTime);
  const title = encodeURIComponent(`【服事】${event.serviceName} - ${event.rolesSummary}`);
  const details = encodeURIComponent(
    `【CCCJB 教会服事】\n岗位：${event.rolesSummary}\n彩排：${event.rehearsalTime || ''}\n地点：${event.serviceVenue || ''}`
  );
  const location = encodeURIComponent(event.serviceVenue || '新山加略山社区教会');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}
