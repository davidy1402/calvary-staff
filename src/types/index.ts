export type RoleCategoryId =
  | 'pulpit'
  | 'worship'
  | 'media'
  | 'sundayschool'
  | 'prayer'
  | 'hospitality';

export type UserMode = 'member' | 'editor';

export interface ConflictItem {
  serviceId: string;
  serviceName: string;
  roleId: string;
  roleName: string;
  date: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  category: RoleCategoryId;
}

export interface RoleCategory {
  id: RoleCategoryId;
  name: string;
  roles: RoleDefinition[];
}

export interface ServiceDefinition {
  id: string;
  name: string;
  shortName: string;
  weekday: number; // 1 = Monday, 7 = Sunday
  time: string;
  rehearsalTime: string;
  venue: string;
  categoryIds: RoleCategoryId[];
}

export interface Coworker {
  id: string;
  name: string;
  englishName: string;
  phone: string;
  cellGroup: string;
  qualifiedRoleIds: string[];
  notes?: string;
  active: boolean;
  avatar?: string; // base64 or URL
}

export interface WorshipSong {
  id: string;
  title: string;
  key?: string; // e.g. G, C, D, Em
  category?: string; // e.g. 快歌 / 慢歌 / 回应
  notes?: string;
}

export interface ServiceRoster {
  id: string; // `${date}_${serviceId}`
  serviceId: string;
  date: string; // YYYY-MM-DD
  theme?: string; // 主题或经文
  specialEvents?: string[]; // 特别聚会标签，例如：圣餐主日、洗礼主日
  speaker?: string; // 讲员（可直接手填或从同工选）
  songs?: WorshipSong[]; // 敬拜赞美歌单
  assignments: Record<string, string[]>; // roleId -> coworkerIds
  dutyNotes?: Record<string, string>; // roleId -> specific duty notes
  notes?: string;
  updatedAt: string;
}

export interface ChurchState {
  churchName: string;
  shortName: string;
  services: ServiceDefinition[];
  roles: RoleDefinition[];
  coworkers: Coworker[];
  rosters: Record<string, ServiceRoster>; // rosterId -> ServiceRoster
}
