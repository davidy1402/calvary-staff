import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useChurch } from '../context/ChurchContext';
import { Search, Trash2, Phone, UserCheck, MessageSquare, X } from 'lucide-react';
import { t } from '../utils/i18n';

interface CoworkerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoworkerManagerModal: React.FC<CoworkerManagerModalProps> = ({ isOpen, onClose }) => {
  const { churchState, addCoworker, deleteCoworker, language } = useChurch();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [phone, setPhone] = useState('');
  const [cellGroup, setCellGroup] = useState('青年牧区 Ignite');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!isOpen) return null;

  const filteredCoworkers = churchState.coworkers.filter((cw) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      cw.name.toLowerCase().includes(q) ||
      cw.englishName.toLowerCase().includes(q) ||
      cw.cellGroup.toLowerCase().includes(q)
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCoworker({
      name: name.trim(),
      englishName: englishName.trim(),
      phone: phone.trim(),
      cellGroup: cellGroup.trim(),
      qualifiedRoleIds: selectedRoles,
      active: true,
    });

    setName('');
    setEnglishName('');
    setPhone('');
    setSelectedRoles([]);
    setIsAdding(false);
  };

  const toggleRoleSelection = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const roleMap = new Map(churchState.roles.map((r) => [r.id, r]));

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-slate-50 w-full max-w-lg mx-auto rounded-t-[28px] rounded-b-none shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Native iOS Grab Handle */}
        <div
          onClick={onClose}
          className="w-full pt-3 pb-2 flex justify-center bg-white shrink-0 cursor-pointer"
          title="下拉或点击关闭"
        >
          <div className="w-10 h-1 bg-slate-300 rounded-full hover:bg-slate-400 transition-colors" />
        </div>

        {/* Top Bar with Title and Add Action */}
        <div className="px-4 pb-2.5 pt-0.5 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="text-left">
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              {t('coworkerDirectoryTitle', language)}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">
              {filteredCoworkers.length} {t('coworker', language)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding((prev) => !prev)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 active:opacity-60 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
          >
            {isAdding ? t('cancel', language) : `+ ${t('addCoworker', language)}`}
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-200/70 shrink-0">
          <div className="relative">
            <Search
              size={15}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchCoworker', language)}
              className="w-full pl-9 pr-8 py-2 bg-slate-100 text-xs text-slate-800 placeholder-slate-400 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-300 text-white flex items-center justify-center cursor-pointer"
              >
                <X size={10} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 pb-8 sm:pb-6">
          {/* Add Form Card */}
          {isAdding && (
            <form
              onSubmit={handleCreate}
              className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-xs space-y-3 animate-slide-up"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">{t('addCoworker', language)}</h3>
                <span className="text-[10px] text-blue-600 font-medium">必填*</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    中文姓名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：陈美玲"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    英文姓名
                  </label>
                  <input
                    type="text"
                    value={englishName}
                    onChange={(e) => setEnglishName(e.target.value)}
                    placeholder="例如：Mary Tan"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    WhatsApp 电话
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="012-3456789"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    所属牧区 / 小组
                  </label>
                  <input
                    type="text"
                    value={cellGroup}
                    onChange={(e) => setCellGroup(e.target.value)}
                    placeholder="例如：青年牧区 Ignite"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  可服事岗位（可多选）
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {churchState.roles.map((r) => {
                    const isSelected = selectedRoles.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleRoleSelection(r.id)}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {r.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                >
                  <UserCheck size={14} strokeWidth={2} />
                  <span>{t('save', language)}</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Coworkers */}
          {filteredCoworkers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              {t('noCoworkerFound', language)}
            </div>
          ) : (
            filteredCoworkers.map((cw) => {
              const letter = cw.name.trim()[0] || '服';
              const cleanPhone = cw.phone.replace(/[^0-9]/g, '').replace(/^0/, '');

              return (
                <div
                  key={cw.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Avatar circle */}
                    {cw.avatar ? (
                      <img
                        src={cw.avatar}
                        alt={cw.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0 border border-blue-100">
                        {letter}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{cw.name}</span>
                        {cw.englishName && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            ({cw.englishName})
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-100">
                          {cw.cellGroup}
                        </span>
                      </div>

                      {cw.phone && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Phone size={11} strokeWidth={1.75} className="text-slate-400" />
                            <span>{cw.phone}</span>
                          </span>
                          <a
                            href={`https://wa.me/60${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                            title="打开 WhatsApp 发送消息"
                          >
                            <MessageSquare size={10} strokeWidth={2} />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}

                      {cw.qualifiedRoleIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {cw.qualifiedRoleIds.slice(0, 4).map((rId) => {
                            const r = roleMap.get(rId);
                            return r ? (
                              <span
                                key={rId}
                                className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-md"
                              >
                                {r.name}
                              </span>
                            ) : null;
                          })}
                          {cw.qualifiedRoleIds.length > 4 && (
                            <span className="text-[10px] text-slate-400">
                              +{cw.qualifiedRoleIds.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`确定要移除服侍人员 ${cw.name} 吗？`)) {
                        deleteCoworker(cw.id);
                      }
                    }}
                    aria-label={`移除 ${cw.name}`}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 size={15} strokeWidth={1.75} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
