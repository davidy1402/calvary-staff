export interface RoleDefinition {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  category: 'pulpit' | 'worship' | 'media' | 'hospitality';
}

export interface RoleCategory {
  id: 'pulpit' | 'worship' | 'media' | 'hospitality';
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
  categoryIds: ('pulpit' | 'worship' | 'media' | 'hospitality')[];
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
}

export interface ServiceRoster {
  id: string; // `${date}_${serviceId}`
  serviceId: string;
  date: string; // YYYY-MM-DD
  theme?: string; // 主题或经文
  specialEvents?: string[]; // 特别聚会标签，例如：圣餐主日、洗礼主日
  speaker?: string; // 讲员（可直接手填或从同工选）
  assignments: Record<string, string[]>; // roleId -> coworkerIds
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
