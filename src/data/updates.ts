export interface UpdateHighlight {
  category: 'ui' | 'feature' | 'fix';
  label: string;
  title: string;
  description: string;
}

export interface AppRelease {
  version: string;
  releaseDate: string;
  title: string;
  summary: string;
  highlights: UpdateHighlight[];
}

export const CURRENT_VERSION: AppRelease = {
  version: '1.6.0',
  releaseDate: '2026-10-04',
  title: '同工生日关怀体系与权限保护升级',
  summary: '带来同工生日彩花气球送福、全功能编辑防误触保护，并全面更新聚会场地与服侍称谓。',
  highlights: [
    {
      category: 'feature',
      label: '生日关怀',
      title: '同工生日彩花气球与祝福',
      description: '寿星当天打开应用迎来生日快乐彩花与气球动画，祝贺语自动切为「生日蒙福」，其他同工首页可看到今日寿星并一键发送 WhatsApp 祝福；每人可在个人中心填写生日。',
    },
    {
      category: 'feature',
      label: '防误触保护',
      title: '严格管理权限保护',
      description: '仅在解锁统筹管理模式（Editor）下显示排班、堂次、同工及主题的编辑与添加按钮，默认只读浏览，杜绝日常查阅时的误触改动。',
    },
    {
      category: 'fix',
      label: '称谓规范',
      title: '场地地点与服侍称谓更新',
      description: '规范聚会地点为 Hall 1 与 Hall 2；大门迎宾更名为「招待」，主日学主教更名为「主日学老师」，奉献点数更名为「收奉献」。',
    },
  ],
};

export const PAST_RELEASES: AppRelease[] = [
  {
    version: '1.5.0',
    releaseDate: '2026-10-04',
    title: '弹窗手感与同工身份切换体验升级',
    summary: '带来 iOS 级原生流畅弹窗手感、新同工自主登记与 iPad 横屏大屏适配。',
    highlights: [
      {
        category: 'ui',
        label: '原生手感',
        title: 'Bottom Sheet 流畅上下滑行动画',
        description: '弹窗展开由下而上、关闭由上至下平滑滑出，搭配 iOS 级阻尼曲线与手势拖拽关闭，告别突兀闪退。',
      },
      {
        category: 'feature',
        label: '同工登记',
        title: '新同工快速登记与访客浏览',
        description: '首次访问可轻松选取自己的名字；新加入服侍的同工可直接登记姓名进入系统，或选择以访客身份浏览。',
      },
      {
        category: 'ui',
        label: '大屏适配',
        title: 'iPad / 平板横屏悬浮导览轨',
        description: '在平板与桌面横屏下自动转换为右侧悬浮胶囊导览轨，视野更广，查阅排班更轻松。',
      },
    ],
  },
  {
    version: '1.4.0',
    releaseDate: '2026-10-04',
    title: '排班表与界面优化',
    summary: '带来更顺畅直观的排班查阅与编辑体验。',
    highlights: [
      {
        category: 'feature',
        label: '主日置顶',
        title: '优先查看来临主日',
        description: '打开排班表自动置顶并展开本周聚会，已过去的聚会移至底部收纳。',
      },
      {
        category: 'feature',
        label: '简单直观',
        title: '排班编辑更明确',
        description: '统筹同工点击管理排班即可调整人员，修改完点击完成即可锁定。',
      },
      {
        category: 'ui',
        label: '清爽呼吸',
        title: '排版整齐干净',
        description: '精简多余的边框与背景底色，层级更少，查阅更舒服。',
      },
    ],
  },
  {
    version: '1.3.0',
    releaseDate: '2026-10-04',
    title: '最新功能与排版体验升级',
    summary: '包含歌单规整双行排版、YouTube 试听入口微质感柔和化、全龄友善字体系统以及在线访问支持。',
    highlights: [
      {
        category: 'ui',
        label: '视觉规整',
        title: '诗歌歌单排版双行对齐',
        description: '固定为上下双行布局，歌名单行截断，Key 调性、快歌/慢歌/回应标签及备注水平对齐，所有卡片等高平整，告别参差错落。',
      },
      {
        category: 'ui',
        label: '视觉降噪',
        title: 'YouTube 试听按钮柔和化',
        description: '暗黑模式下改用精致微质感方圆底板配红色播放图标，告别刺眼纯红大方块，即点即播且不抢夺视觉焦点。',
      },
      {
        category: 'ui',
        label: '消除误解',
        title: '服装要求等提示告别警报红',
        description: '将「服装要求: 白黑」等常规说明标签重构为高质感 Slate/Zinc 中性灰调徽章，消除系统报错感。',
      },
      {
        category: 'ui',
        label: '全龄关怀',
        title: 'Inter 与现代黑体系统',
        description: '西文数字与调号大字距清晰易读，中文正文采用苹方与鸿蒙黑体，中宫舒展，长辈轻松阅读，年轻人视觉高级。',
      },
      {
        category: 'feature',
        label: '云端上线',
        title: '专属网址免安装访问',
        description: '支持手机浏览器直接打开与保存到桌面主屏幕，随时随地查阅个人侍奉表与排班动态。',
      },
    ],
  },
  {
    version: '1.2.0',
    releaseDate: '2026-10-03',
    title: 'CCCJB 称谓规范与聚会自定义',
    summary: '规范五大群体称谓与四堂聚会基础数据，新增聚会时间与地点编辑权限。',
    highlights: [
      {
        category: 'feature',
        label: '堂次管理',
        title: '聚会时间与场地自定义',
        description: '管理员可随时修改聚会时间、彩排调音时间与场地地点。',
      },
      {
        category: 'fix',
        label: '称谓规范',
        title: '全面对齐 CCCJB 真实用语',
        description: '规范为职青、大专、青少年、牧者、同工，纠正报告、司琴、当天讲员等标准称谓。',
      },
      {
        category: 'ui',
        label: '连续圆角',
        title: 'Squircle 现代圆角语言',
        description: '去除生硬矩形与过度椭圆，采用更符合人眼直觉的平滑平移圆角。',
      },
    ],
  },
];
