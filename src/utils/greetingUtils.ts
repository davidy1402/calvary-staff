export function getTimeGreeting(language: 'zh' | 'en' = 'zh', testHour?: number): string {
  const hour = testHour !== undefined ? testHour : new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return language === 'zh' ? '早上好' : 'Good morning';
  } else if (hour >= 12 && hour < 14) {
    return language === 'zh' ? '午安' : 'Good afternoon';
  } else if (hour >= 14 && hour < 18) {
    return language === 'zh' ? '下午好' : 'Good afternoon';
  } else if (hour >= 18 && hour < 22) {
    return language === 'zh' ? '晚上好' : 'Good evening';
  } else {
    return language === 'zh' ? '怎么还不睡' : 'Rest well';
  }
}
