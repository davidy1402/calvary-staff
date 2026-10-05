import React, { useRef, useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import type { Coworker } from '../types';
import { Search, Trash2, Phone, UserCheck, X, Pencil, UserPlus, Camera } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { t } from '../utils/i18n';
import { AvatarCropperModal } from './AvatarCropperModal';

interface CoworkerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHURCH_GROUPS = ['职青', '大专', '青少年', '牧者', '同工'] as const;

export const CoworkerManagerModal: React.FC<CoworkerManagerModalProps> = ({ isOpen, onClose }) => {
  const { churchState, addCoworker, updateCoworker, deleteCoworker, userMode, language } = useChurch();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoworkerId, setEditingCoworkerId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [cellGroup, setCellGroup] = useState<string>('职青');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | undefined>();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const editingCoworker = editingCoworkerId
    ? churchState.coworkers.find((coworker) => coworker.id === editingCoworkerId) ?? null
    : null;

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEnglishName('');
    setPhone('');
    setBirthday('');
    setCellGroup('职青');
    setSelectedRoles([]);
    setEditingCoworkerId(null);
    setAvatar(undefined);
    setIsFormOpen(false);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleStartEdit = (cw: Coworker) => {
    setEditingCoworkerId(cw.id);
    setName(cw.name);
    setEnglishName(cw.englishName || '');
    setPhone(cw.phone || '');
    setBirthday(cw.birthday || '');
    setCellGroup(cw.cellGroup || '职青');
    setSelectedRoles(cw.qualifiedRoleIds || []);
    setAvatar(cw.avatar);
    setIsFormOpen(true);
  };

  const filteredCoworkers = churchState.coworkers.filter((cw) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      cw.name.toLowerCase().includes(q) ||
      cw.englishName.toLowerCase().includes(q) ||
      cw.cellGroup.toLowerCase().includes(q) ||
      (cw.birthday && cw.birthday.includes(q))
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCoworkerId) {
      const currentCoworker = churchState.coworkers.find((coworker) => coworker.id === editingCoworkerId);
      if (!currentCoworker) return;
      updateCoworker({
        ...currentCoworker,
        name: name.trim(),
        englishName: englishName.trim(),
        phone: phone.trim(),
        birthday: birthday.trim(),
        cellGroup: cellGroup.trim() || '同工',
        qualifiedRoleIds: selectedRoles,
        avatar,
      });
    } else {
      addCoworker({
        name: name.trim(),
        englishName: englishName.trim(),
        phone: phone.trim(),
        birthday: birthday.trim(),
        cellGroup: cellGroup.trim() || '职青',
        qualifiedRoleIds: selectedRoles,
        active: true,
        avatar,
      });
    }

    resetForm();
  };

  const toggleRoleSelection = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const roleMap = new Map(churchState.roles.map((r) => [r.id, r]));

  return (
    <>
    <BottomSheet isOpen={isOpen} onClose={onClose} className="bg-slate-50 dark:bg-black" maxHeight="88vh">
      {/* Fluid Header Area with Seamless Integrated Search */}
      <div className="px-5 pt-2 pb-3 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 leading-tight">
              {t('coworkerDirectoryTitle', language)}
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
              {filteredCoworkers.length} {t('coworker', language)}
            </p>
          </div>

          {userMode === 'editor' && (
            <button
              type="button"
              onClick={() => {
                if (isFormOpen) {
                  resetForm();
                } else {
                  handleStartAdd();
                }
              }}
              title={isFormOpen ? t('cancel', language) : '添加服侍人员'}
              aria-label={isFormOpen ? t('cancel', language) : '添加服侍人员'}
              className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-2xs transition-all cursor-pointer"
            >
              {isFormOpen ? (
                <X size={16} strokeWidth={2.2} />
              ) : (
                <UserPlus size={16} strokeWidth={2.2} />
              )}
            </button>
          )}
        </div>

        {/* Seamless Floating Search Bar */}
        <div className="relative">
          <Search
            size={15}
            strokeWidth={2}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchCoworker', language)}
            className="w-full pl-9 pr-8 py-2 bg-slate-200/70 dark:bg-zinc-800/80 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 rounded-xl border border-transparent focus:border-blue-500/40 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-md bg-slate-300 dark:bg-zinc-600 text-white flex items-center justify-center cursor-pointer"
            >
              <X size={10} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 overflow-y-auto flex-1 space-y-3 pb-8 sm:pb-6">
        {/* Add / Edit Form Sheet */}
        {isFormOpen && (
          <BottomSheet
            isOpen={isFormOpen}
            onClose={resetForm}
            className="bg-slate-50 dark:bg-black"
            maxHeight="88dvh"
          >
          <form
            onSubmit={handleSubmit}
            className="p-4 overflow-y-auto flex-1 bg-white dark:bg-zinc-900 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                {editingCoworker ? (
                  <>
                    <Pencil size={13} className="text-blue-600 dark:text-blue-400" />
                    <span>编辑资料: {editingCoworker.name}</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={13} className="text-blue-600 dark:text-blue-400" />
                    <span>添加新服侍人员</span>
                  </>
                )}
              </h3>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">必填*</span>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-zinc-800 p-2.5 border border-slate-200 dark:border-zinc-700">
              {avatar ? (
                <img src={avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-zinc-700" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-zinc-700 text-blue-700 dark:text-blue-300 flex items-center justify-center text-base font-bold">
                  {name.trim()[0] || '同'}
                </div>
              )}
              <button type="button" onClick={() => avatarInputRef.current?.click()} className="ml-auto min-h-11 px-3 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-zinc-700 hover:bg-blue-100 dark:hover:bg-zinc-600 flex items-center gap-1.5">
                <Camera size={14} />
                {avatar ? (language === 'zh' ? '更换' : 'Change') : (language === 'zh' ? '上传' : 'Upload')}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setAvatarFile(file);
                event.target.value = '';
              }} />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  中文姓名 *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：陈美玲"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  英文姓名
                </label>
                <input
                  type="text"
                  value={englishName}
                  onChange={(e) => setEnglishName(e.target.value)}
                  placeholder="例如：Mary Tan"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  WhatsApp 电话
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="例如：012-3456789"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  生日日期
                </label>
                <input
                  type="text"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  placeholder="例如：10-30 或 1998-10-30"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Group Selector Chips (职青 / 大专 / 青少年 / 牧者 / 同工) + Direct Tag Editing */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                所属分组
              </label>
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                {CHURCH_GROUPS.map((grp) => {
                  const isSelected = cellGroup === grp;
                  return (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setCellGroup(grp)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-blue-400'
                      }`}
                    >
                      {grp}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={cellGroup}
                onChange={(e) => setCellGroup(e.target.value)}
                placeholder="点击上方快捷选择，或直接输入修改分组"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Qualified Roles */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                服侍专长（可多选）
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700">
                {churchState.roles.map((r) => {
                  const isSelected = selectedRoles.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleRoleSelection(r.id)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-zinc-700 text-slate-600 dark:text-zinc-200 border-slate-200 dark:border-zinc-600 hover:bg-slate-100 dark:hover:bg-zinc-600'
                      }`}
                    >
                      {r.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={resetForm}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
              >
                {t('cancel', language)}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
              >
                <UserCheck size={14} strokeWidth={2.2} />
                <span>{editingCoworker ? '保存修改' : t('save', language)}</span>
              </button>
            </div>
          </form>
          </BottomSheet>
        )}

        {/* List of Coworkers */}
        {filteredCoworkers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-xs">
            {t('noCoworkerFound', language)}
          </div>
        ) : (
          filteredCoworkers.map((cw) => {
            const letter = cw.name.trim()[0] || '同';
            const cleanPhone = cw.phone ? cw.phone.replace(/[^0-9]/g, '').replace(/^0/, '') : '';

            return (
              <div
                key={cw.id}
                className="p-3.5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Avatar squircle (not sharp square, not oval) */}
                  {cw.avatar ? (
                    <img
                      src={cw.avatar}
                      alt={cw.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold shrink-0 border border-blue-100 dark:border-zinc-700">
                      {letter}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{cw.name}</span>
                      {cw.englishName && (
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                          ({cw.englishName})
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-zinc-700">
                        {cw.cellGroup}
                      </span>
                      {cw.birthday && (
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-900/60 flex items-center gap-1">
                          <span>🎂</span>
                          <span>{cw.birthday}</span>
                        </span>
                      )}
                    </div>

                    {cw.phone && (
                      <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-zinc-400">
                        {cleanPhone ? (
                          <a
                            href={`https://wa.me/60${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-5 items-center gap-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 font-medium hover:text-emerald-800 dark:hover:text-emerald-200 hover:underline underline-offset-2 transition-colors cursor-pointer"
                            title="打开 WhatsApp 发送消息"
                          >
                            <Phone size={12} strokeWidth={1.9} />
                            <span>{cw.phone}</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone size={12} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500" />
                            <span>{cw.phone}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {cw.qualifiedRoleIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {cw.qualifiedRoleIds.slice(0, 4).map((rId) => {
                          const r = roleMap.get(rId);
                          return r ? (
                            <span
                              key={rId}
                              className="text-[10px] text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md"
                            >
                              {r.name}
                            </span>
                          ) : null;
                        })}
                        {cw.qualifiedRoleIds.length > 4 && (
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            +{cw.qualifiedRoleIds.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit and Delete Actions - only visible in admin/editor mode */}
                {userMode === 'editor' && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cw)}
                      aria-label={`编辑 ${cw.name}`}
                      title="编辑资料"
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Pencil size={14} strokeWidth={2} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`确定要移除服侍人员 ${cw.name} 吗？`)) {
                          deleteCoworker(cw.id);
                        }
                      }}
                      aria-label={`移除 ${cw.name}`}
                      title="移除服侍人员"
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </BottomSheet>
    <AvatarCropperModal
      file={avatarFile}
      language={language}
      onClose={() => setAvatarFile(null)}
      onCrop={(croppedAvatar) => { setAvatar(croppedAvatar); setAvatarFile(null); }}
    />
    </>
  );
};
