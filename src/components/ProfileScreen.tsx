import React, { useState, useRef } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  MessageSquare,
  Users,
  Calendar,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Languages,
  Camera,
  RotateCcw,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';
import { CoworkerManagerModal } from './CoworkerManagerModal';
import { ServiceManagerModal } from './ServiceManagerModal';
import { compressAvatarImage } from '../utils/imageUtils';
import { t } from '../utils/i18n';

export const ProfileScreen: React.FC = () => {
  const {
    churchState,
    currentUser,
    currentUserId,
    setCurrentUserId,
    userMode,
    setUserMode,
    updateCurrentUserAvatar,
    language,
    setLanguage,
    isDarkMode,
    toggleDarkMode,
  } = useChurch();

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isCoworkersOpen, setIsCoworkersOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isPermissionsGuideOpen, setIsPermissionsGuideOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarLetter =
    currentUser?.name?.trim()?.[0] || (language === 'zh' ? '服' : 'V');

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedBase64 = await compressAvatarImage(file);
      updateCurrentUserAvatar(compressedBase64);
    } catch (err) {
      console.error('Failed to compress/save avatar', err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要恢复默认文字头像吗？')) {
      updateCurrentUserAvatar('');
    }
  };

  return (
    <div className="space-y-4 animate-slide-up pb-8">
      {/* Centered AppBar */}
      <div className="bg-white/95 dark:bg-black/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 -mx-4 -mt-4 px-4 py-2.5 mb-2 sticky top-0 z-20 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="CCCJB" className="w-7 h-7 object-contain shrink-0 dark:hidden" />
          <img src="/logo-white.png" alt="CCCJB" className="w-7 h-7 object-contain shrink-0 hidden dark:block" />
          <h1 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            CCCJB {t('settingsTitle', language)}
          </h1>
        </div>
      </div>

      {/* Volunteer Identity Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-3.5">
        <div className="flex items-center gap-3.5">
          {/* Avatar with Camera Icon Overlay */}
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={t('changeAvatar', language)}
              className="relative w-14 h-14 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer block border-2 border-white dark:border-zinc-800 shadow-xs"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-100 dark:bg-zinc-800 text-blue-900 dark:text-zinc-100 flex items-center justify-center text-xl font-black">
                  {avatarLetter}
                </div>
              )}

              {/* Camera Hover/Touch Overlay */}
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={16} strokeWidth={2.2} />
              </div>
            </button>

            {/* Camera badge bottom right */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={t('changeAvatar', language)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-2xs cursor-pointer active:scale-95 transition-transform"
            >
              <Camera size={12} strokeWidth={2.5} />
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFile}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {currentUser?.name || (language === 'zh' ? 'CCCJB 服事同工' : 'CCCJB Volunteer')}
              </h2>
              {currentUser?.englishName && (
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">({currentUser.englishName})</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-zinc-700">
                {currentUser?.cellGroup || '大专'}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                {t('coworker', language)}
              </span>
            </div>

            {/* Remove custom avatar action (only shown when custom photo exists) */}
            {currentUser?.avatar && (
              <div className="mt-1.5">
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-[10px] font-medium text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={10} strokeWidth={2} />
                  <span>{t('removeAvatar', language)}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Switch Identity Dropdown */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span className="font-medium text-slate-600 dark:text-zinc-300">{t('switchCoworkerIdentity', language)}:</span>
          <select
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            className="text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[190px] truncate"
          >
            {churchState.coworkers.map((cw) => (
              <option key={cw.id} value={cw.id} className="dark:bg-zinc-800 dark:text-zinc-100">
                {cw.name} ({cw.cellGroup})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode & Permission Card (Diana & Selena's permission protection) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
              {language === 'zh' ? '操作模式' : 'Mode'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {language === 'zh' ? '只读防误触，开启后可安排服事' : 'Toggle read-only or edit access'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setUserMode('member')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              userMode === 'member'
                ? 'bg-blue-50/80 dark:bg-zinc-800 border-blue-600 dark:border-blue-500 text-blue-950 dark:text-zinc-100 shadow-2xs'
                : 'bg-slate-50 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">
                {language === 'zh' ? '只读模式' : 'Read-only'}
              </span>
              {userMode === 'member' && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-relaxed">
              {language === 'zh' ? '仅查看服事安排，防止误触' : 'Read-only view, safe from accidental changes'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setUserMode('editor')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              userMode === 'editor'
                ? 'bg-blue-50/80 dark:bg-zinc-800 border-blue-600 dark:border-blue-500 text-blue-950 dark:text-zinc-100 shadow-2xs'
                : 'bg-slate-50 dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">
                {language === 'zh' ? '编辑模式' : 'Editor Mode'}
              </span>
              {userMode === 'editor' && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-relaxed">
              {language === 'zh' ? '可安排人员与修改聚会主题' : 'Assign members and edit themes'}
            </p>
          </button>
        </div>
      </div>

      {/* Identity & Permission Architecture Guide (CCCJB Standards) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsPermissionsGuideOpen(!isPermissionsGuideOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <KeyRound size={17} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>{language === 'zh' ? '身份体系与权限说明' : 'Identities & Permissions Guide'}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                  {language === 'zh' ? '权限清单' : 'Matrix'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                {language === 'zh'
                  ? '查看普通同工(只读)与统筹管理员(编辑)的权限划分'
                  : 'View permission differences between Member and Editor'}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-slate-400 dark:text-zinc-500 pl-2">
            {isPermissionsGuideOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {isPermissionsGuideOpen && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-zinc-800 space-y-3.5 text-xs text-slate-600 dark:text-zinc-400">
            {/* 1. Operation Modes */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                {language === 'zh' ? '一、系统操作权限矩阵' : '1. System Access Modes'}
              </span>

              {/* Editor Mode Card */}
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-zinc-800/80 border border-blue-200/70 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400" />
                    <span>{language === 'zh' ? '统筹管理员 (Editor / Admin)' : 'Editor / Admin'}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-200/80 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200">
                    {language === 'zh' ? '全部编排特权' : 'Full Access'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-300">
                  {language === 'zh'
                    ? '适用人员：敬拜团负责人、影音主管、事工部长与传道牧者（Selena、凯曰、David等）'
                    : 'Target: Worship leaders, AV directors, ministry heads, and pastors'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span>排班编排调度与多部门撞期拦截</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span>自定义4堂崇拜与祷告会时间地点</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span>敬拜歌单录入、Key调号与YouTube绑定</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span>聚会主题、当天讲员与圣餐服装标签</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span>同工名录新增、信息编辑与岗位资格</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span>系统完整数据备份导出与恢复</span>
                  </div>
                </div>
              </div>

              {/* Member Mode Card */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 text-xs">
                    <Lock size={13} className="text-slate-500 dark:text-zinc-400" />
                    <span>{language === 'zh' ? '普通同工 / 会友 (Member / Read-Only)' : 'Member / Read-Only'}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                    {language === 'zh' ? '只读防误触' : 'Read-Only'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {language === 'zh'
                    ? '适用人员：所有服事人员日常查阅、团员会友、教会长辈（默认模式）'
                    : 'Target: General congregation, volunteers, and senior members for safe browsing'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>查看完整排班表与「我的本月服事」</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>歌单红底 YouTube 按钮在线视听练习</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>查看同工名录电话与所属群体</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>WhatsApp 文本一键生成与复制发群</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>锁定排班指派（防止误触调动他人）</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>锁定歌单与堂次设置（保障数据安全）</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Cell Groups */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                {language === 'zh' ? '二、加略山 5 大群体分类' : '2. CCCJB 5 Cell Groups'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-100 dark:border-zinc-700">
                  牧者 (教牧与传道)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-100 dark:border-zinc-700">
                  职青 (青年在职主力)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-zinc-800 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-100 dark:border-zinc-700">
                  大专 (大专院校骨干)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-zinc-800 text-cyan-700 dark:text-cyan-300 font-bold text-xs border border-cyan-100 dark:border-zinc-700">
                  青少年 (青年梯队)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-100 dark:border-zinc-700">
                  同工 (跨部门义工关怀)
                </span>
              </div>
            </div>

            {/* 3. Departments */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                {language === 'zh' ? '三、6 大服事事工部门' : '3. 6 Ministries Covered'}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                讲台与报告 (讲员/报告/读经)、敬拜赞美团 (领唱/伴唱/司琴/吉他/贝司/鼓/铃鼓)、影音多媒体 (总监/PA音响/PPT电脑/OBS直播/CAM拍摄/灯光)、主日学儿童事工 (主教/助教)、守望代祷事工 (聚前代祷/守望)、接待与关怀 (招待长/迎宾/奉献点数)。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Ministry & Coordination Tools */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden">
        {/* WhatsApp Export */}
        <div
          onClick={() => setIsWhatsAppOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-zinc-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MessageSquare size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                {t('shareWhatsAppTitle', language)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {t('shareWhatsAppDesc', language)}
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 shrink-0" />
        </div>

        {/* Volunteer Directory */}
        <div
          onClick={() => setIsCoworkersOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-zinc-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                {t('coworkerDirectoryTitle', language)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {t('coworkerDirectoryDesc', language)} ({churchState.coworkers.length})
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 shrink-0" />
        </div>

        {/* Service Settings */}
        <div
          onClick={() => setIsServicesOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors active:bg-slate-100 dark:active:bg-zinc-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Calendar size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                {t('serviceSettingsTitle', language)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {t('serviceSettingsDesc', language)}
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 shrink-0" />
        </div>
      </div>

      {/* Appearance / Dark Mode Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            {isDarkMode ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
              {language === 'zh' ? '外观显示' : 'Appearance'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {isDarkMode
                ? (language === 'zh' ? '已开启深色夜间模式' : 'Dark mode enabled')
                : (language === 'zh' ? '当前为浅色白底模式' : 'Light mode enabled')}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className={`w-12 h-7 rounded-full transition-colors duration-200 relative p-0.5 cursor-pointer ${
            isDarkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-zinc-700'
          }`}
          aria-label={language === 'zh' ? '切换深浅色外观' : 'Toggle theme'}
        >
          <div
            className={`w-6 h-6 rounded-full bg-white shadow-xs transition-transform duration-200 flex items-center justify-center ${
              isDarkMode ? 'translate-x-5 text-blue-600' : 'translate-x-0 text-amber-500'
            }`}
          >
            {isDarkMode ? <Moon size={12} strokeWidth={2.2} /> : <Sun size={12} strokeWidth={2.2} />}
          </div>
        </button>
      </div>

      {/* Language Preference Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Languages size={17} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
              {t('language', language)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {t('languageDesc', language)}
            </p>
          </div>
        </div>

        {/* Segmented Control for Language */}
        <div className="bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl flex items-center shrink-0 border border-slate-200/60 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setLanguage('zh')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              language === 'zh'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            中文
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Subtle Warm Footnote */}
      <div className="text-center pt-3 space-y-1">
        <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('churchFooterName', language)}</p>
        <p className="text-[10px] text-slate-300 dark:text-zinc-600">v1.2</p>
      </div>

      {/* WhatsApp Bottom Sheet Modal */}
      {isWhatsAppOpen && (
        <WhatsAppModal
          isOpen={true}
          onClose={() => setIsWhatsAppOpen(false)}
        />
      )}

      {/* Volunteer Directory Bottom Sheet Modal */}
      {isCoworkersOpen && (
        <CoworkerManagerModal
          isOpen={true}
          onClose={() => setIsCoworkersOpen(false)}
        />
      )}

      {/* Service Settings Bottom Sheet Modal */}
      {isServicesOpen && (
        <ServiceManagerModal
          isOpen={true}
          onClose={() => setIsServicesOpen(false)}
        />
      )}
    </div>
  );
};
