import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { X, Search, Plus, Trash2, Phone, UserCheck, Users } from 'lucide-react';

interface CoworkerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoworkerManagerModal: React.FC<CoworkerManagerModalProps> = ({ isOpen, onClose }) => {
  const { churchState, addCoworker, deleteCoworker } = useChurch();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [phone, setPhone] = useState('');
  const [cellGroup, setCellGroup] = useState('青年牧区 Ignite');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-xl animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={18} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                同工名录 ({churchState.coworkers.length} 位)
              </h2>
              <p className="text-xs text-slate-500">管理加略山各堂会与牧区同工名单</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Search & Add Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索同工姓名或牧区..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsAdding((prev) => !prev)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
          >
            <Plus size={14} strokeWidth={2} />
            <span>{isAdding ? '取消' : '录入新同工'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {isAdding && (
            <form onSubmit={handleCreate} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mb-3">
              <h3 className="text-xs font-bold text-slate-800">录入新同工资料</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">中文姓名 *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：陈美玲"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">英文名</label>
                  <input
                    type="text"
                    value={englishName}
                    onChange={(e) => setEnglishName(e.target.value)}
                    placeholder="例如：Mary Tan"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">WhatsApp 电话</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="012-3456789"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">所属牧区</label>
                  <input
                    type="text"
                    value={cellGroup}
                    onChange={(e) => setCellGroup(e.target.value)}
                    placeholder="大卫牧区、约书亚区..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">常用岗位（可多选）</label>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1.5 bg-white rounded-lg border border-slate-200">
                  {churchState.roles.map((r) => {
                    const isSelected = selectedRoles.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleRoleSelection(r.id)}
                        className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
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
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1 shadow-2xs"
                >
                  <UserCheck size={13} strokeWidth={2} />
                  <span>确认添加</span>
                </button>
              </div>
            </form>
          )}

          {filteredCoworkers.map((cw) => (
            <div
              key={cw.id}
              className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">{cw.name}</span>
                  {cw.englishName && (
                    <span className="text-[11px] text-slate-500 font-medium">({cw.englishName})</span>
                  )}
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                    {cw.cellGroup}
                  </span>
                </div>
                {cw.phone && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <Phone size={11} strokeWidth={1.75} className="text-slate-400" />
                    <span>{cw.phone}</span>
                  </div>
                )}
                {cw.qualifiedRoleIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {cw.qualifiedRoleIds.slice(0, 4).map((rId) => {
                      const r = roleMap.get(rId);
                      return r ? (
                        <span key={rId} className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          {r.name}
                        </span>
                      ) : null;
                    })}
                    {cw.qualifiedRoleIds.length > 4 && (
                      <span className="text-[10px] text-slate-400">+{cw.qualifiedRoleIds.length - 4}</span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`确定要移除同工 ${cw.name} 吗？`)) {
                    deleteCoworker(cw.id);
                  }
                }}
                aria-label={`移除 ${cw.name}`}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
              >
                <Trash2 size={14} strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
