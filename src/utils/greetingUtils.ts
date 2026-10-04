export interface GreetingInfo {
  title: string;
  caringWord: string;
  badge: string;
  period: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'lateNight';
}

/**
 * Returns a warm, time-aware greeting and caring message based on current hour.
 */
export function getTimeGreeting(language: 'zh' | 'en' = 'zh', testHour?: number): GreetingInfo {
  const hour = testHour !== undefined ? testHour : new Date().getHours();

  if (hour >= 0 && hour < 5) {
    return {
      title: language === 'zh' ? '夜深了' : 'Late night',
      caringWord:
        language === 'zh'
          ? '怎么还不睡呢？早点休息，明天还要为主奔跑～'
          : 'Still awake? Rest well and wake up recharged tomorrow.',
      badge: language === 'zh' ? '深夜守望' : 'Late night',
      period: 'lateNight',
    };
  } else if (hour >= 5 && hour < 9) {
    return {
      title: language === 'zh' ? '清晨平安' : 'Good morning',
      caringWord:
        language === 'zh'
          ? '愿清晨的日光照亮你的脚步，今天又是充满盼望的一天！'
          : 'His mercies are new every morning. Have a blessed day!',
      badge: language === 'zh' ? '晨光初现' : 'Morning peace',
      period: 'dawn',
    };
  } else if (hour >= 9 && hour < 12) {
    return {
      title: language === 'zh' ? '早上好' : 'Good morning',
      caringWord:
        language === 'zh'
          ? '愿主赐你充充足足的智慧与力量，在各样事上得胜。'
          : 'May your morning be filled with strength, wisdom, and joy.',
      badge: language === 'zh' ? '主内早安' : 'Blessed morning',
      period: 'morning',
    };
  } else if (hour >= 12 && hour < 14) {
    return {
      title: language === 'zh' ? '午间平安' : 'Good afternoon',
      caringWord:
        language === 'zh'
          ? '忙碌了一上午，记得按时吃午餐、给心灵歇歇脚哦。'
          : 'Time for lunch and a short break. Be refreshed in His peace.',
      badge: language === 'zh' ? '午间小憩' : 'Lunchtime',
      period: 'noon',
    };
  } else if (hour >= 14 && hour < 18) {
    return {
      title: language === 'zh' ? '下午好' : 'Good afternoon',
      caringWord:
        language === 'zh'
          ? '累了就喝口水，倚靠神的同在重新得力，如鹰展翅上腾。'
          : 'Stay renewed in His grace throughout this afternoon.',
      badge: language === 'zh' ? '午后得力' : 'Afternoon',
      period: 'afternoon',
    };
  } else if (hour >= 18 && hour < 22) {
    return {
      title: language === 'zh' ? '晚上好' : 'Good evening',
      caringWord:
        language === 'zh'
          ? '晚上平安！卸下一天的劳碌，在祂的恩典里得享安歇。'
          : 'Good evening! Cast your cares upon Him and rest peacefully.',
      badge: language === 'zh' ? '晚间平安' : 'Evening peace',
      period: 'evening',
    };
  } else {
    // 22:00 - 23:59
    return {
      title: language === 'zh' ? '怎么还不睡' : 'Rest well',
      caringWord:
        language === 'zh'
          ? '夜幕降临啦，放下手中的琐事早点歇息，愿今夜赐你香甜好梦。'
          : 'It is getting late! Sleep early and wake up recharged.',
      badge: language === 'zh' ? '睡前关怀' : 'Bedtime',
      period: 'lateNight',
    };
  }
}
