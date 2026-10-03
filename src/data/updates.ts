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
      description: '支持手机浏览器直接打开与保存到桌面主屏幕，随时随地查阅个人服事表与排班动态。',
    },
  ],
};

export const PAST_RELEASES: AppRelease[] = [
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
