import React, { useState, useRef } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  MessageSquare,
  Users,
  Calendar,
  Download,
  Upload,
  RotateCcw,
  ChevronRight,
  Clock,
  MapPin,
  X,
  CheckCircle2,
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';
import { CoworkerManagerModal } from './CoworkerManagerModal';

export const ProfileScreen: React.FC = () => {
  const {
    churchState,
    currentUser,
    currentUserId,
    setCurrentUserId,
    exportBackup,
    importBackup,
    resetToDefault,
  } = useChurch();

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isCoworkersOpen, setIsCoworkersOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importBackup(text);
      if (success) {
        setBackupNotice('备份数据恢复成功！');
      } else {
        alert('备份文件格式不正确，导入失败。');
      }
      setTimeout(() => setBackupNotice(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const avatarLetter = currentUser?.name?.trim()?.[0] || '同';

  return (
    <div className="space-y-4">
      {/* Centered AppBar */}
      <div className="bg-white border-b border-slate-200 -mx-4 -mt-4 px-4 py-3.5 mb-4 sticky top-0 z-20">
        <h1 className="text-base font-bold text-slate-900 text-center">個人中心</h1>
      </div>

      {/* User Info Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-2xl font-bold mb-3 shadow-2xs">
          {avatarLetter}
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          {currentUser?.name || '加略山同工'}
        </h2>
        {currentUser?.englishName && (
          <p className="text-xs text-slate-500 font-medium">({currentUser.englishName})</p>
        )}

        {/* Roles & Pastoral Group Badges */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center mt-2.5">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {currentUser?.cellGroup || '青年牧区'}
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            同工
          </span>
        </div>

        {/* Switch Coworker Selector */}
        <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs text-slate-500">
          <span>切换当前同工身份：</span>
          <select
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {churchState.coworkers.map((cw) => (
              <option key={cw.id} value={cw.id}>
                {cw.name} ({cw.cellGroup})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action ListTiles (matching Flutter ProfileScreen) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {/* WhatsApp Export */}
        <div
          onClick={() => setIsWhatsAppOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageSquare size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">WhatsApp 服事表分享</h3>
              <p className="text-[11px] text-slate-500">预览、一键复制或直接唤醒 WhatsApp 发送</p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400" />
        </div>

        {/* Coworker Management */}
        <div
          onClick={() => setIsCoworkersOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">同工名录</h3>
              <p className="text-[11px] text-slate-500">
                录入、修改同工电话与常用服事岗位 ({churchState.coworkers.length} 位)
              </p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400" />
        </div>

        {/* Service Settings */}
        <div
          onClick={() => setIsServicesOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">聚会设定</h3>
              <p className="text-[11px] text-slate-500">检视各堂会聚会时间、彩排与场地</p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400" />
        </div>

        {/* Backup & Restore */}
        <div
          onClick={() => setIsBackupOpen(true)}
          className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Download size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">资料备份与还原</h3>
              <p className="text-[11px] text-slate-500">导出 JSON 档案或导入恢复排班数据</p>
            </div>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-slate-400" />
        </div>
      </div>

      {/* Version Footer (matching Flutter ProfileScreen footnote) */}
      <div className="text-center pt-4 text-xs text-slate-400">
        <p>更新于 2026/10/02</p>
        <p className="text-[10px] mt-0.5 text-slate-300">加略山社区教会 · Calvary Community Church JB</p>
      </div>

      {/* WhatsApp Modal */}
      {isWhatsAppOpen && <WhatsAppModal isOpen={true} onClose={() => setIsWhatsAppOpen(false)} />}

      {/* Coworker Modal */}
      {isCoworkersOpen && <CoworkerManagerModal isOpen={true} onClose={() => setIsCoworkersOpen(false)} />}

      {/* Service Settings Modal */}
      {isServicesOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-xl animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">聚会堂会设定</h2>
              <button
                type="button"
                onClick={() => setIsServicesOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {churchState.services.map((svc) => (
                <div key={svc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{svc.name}</span>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {svc.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock size={12} strokeWidth={1.75} />
                    <span>彩排时间：{svc.rehearsalTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={12} strokeWidth={1.75} />
                    <span>场地地点：{svc.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backup & Restore Modal */}
      {isBackupOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-xl animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">资料备份与还原</h2>
              <button
                type="button"
                onClick={() => setIsBackupOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                所有排班与同工名录保存在本地浏览器中。建议定期导出 JSON 档案备份以防浏览器清理缓存。
              </p>

              {backupNotice && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={16} strokeWidth={2} />
                  <span>{backupNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={exportBackup}
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download size={14} strokeWidth={2} />
                  <span>导出备份 (.json)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Upload size={14} strokeWidth={2} />
                  <span>导入恢复备份</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
                >
                  <RotateCcw size={12} strokeWidth={2} />
                  <span>恢复初始加略山数据</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
