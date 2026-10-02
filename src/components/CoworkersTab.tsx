import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';

import {
  Users,
  Search,
  Plus,
  Phone,
  Tag,
  Trash2,
  X,
  UserCheck,
} from 'lucide-react';

export const CoworkersTab: React.FC = () => {
  const { churchState, addCoworker, deleteCoworker } = useChurch();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Coworker Form State
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [phone, setPhone] = useState('');
  const [cellGroup, setCellGroup] = useState('青年牧区 Ignite');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

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
    setIsAddModalOpen(false);
  };

  const toggleRoleSelection = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const roleMap = new Map(churchState.roles.map((r) => [r.id, r]));

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Users size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                同工名录 ({churchState.coworkers.length} 位)
              </h2>
              <p className="text-xs text-slate-500">
                管理加略山各牧区同工、联系方式与常用岗位
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus size={16} strokeWidth={2} />
            <span>新增同工</span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search
            size={16}
            strokeWidth={1.75}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索同工姓名、英文名或所属牧区..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Coworkers Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredCoworkers.map((cw) => {
          return (
            <div
              key={cw.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900">{cw.name}</h3>
                      {cw.englishName && (
                        <span className="text-xs text-slate-500 font-medium">
                          ({cw.englishName})
                        </span>
                      )}
                    </div>
                    <span className="inline-block text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mt-1 border border-blue-100">
                      {cw.cellGroup}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`确定要删除同工 ${cw.name} 吗？`)) {
                        deleteCoworker(cw.id);
                      }
                    }}
                    aria-label={`删除同工 ${cw.name}`}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={15} strokeWidth={1.75} />
                  </button>
                </div>

                {/* Phone */}
                {cw.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                    <Phone size={13} strokeWidth={1.75} className="text-slate-400" />
                    <span>{cw.phone}</span>
                  </div>
                )}

                {/* Qualified Roles */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {cw.qualifiedRoleIds.length > 0 ? (
                    cw.qualifiedRoleIds.map((rId) => {
                      const role = roleMap.get(rId);
                      return role ? (
                        <span
                          key={rId}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                        >
                          <Tag size={10} strokeWidth={2} />
                          {role.name}
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className="text-xs text-slate-400 italic">未设置常用岗位</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Coworker Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">录入新同工</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  中文姓名 *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：陈美玲"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  英文名 / 昵称
                </label>
                <input
                  type="text"
                  value={englishName}
                  onChange={(e) => setEnglishName(e.target.value)}
                  placeholder="例如：Mary Tan"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  联系电话 (WhatsApp)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="例如：012-3456789"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  所属牧区 / 小组
                </label>
                <input
                  type="text"
                  value={cellGroup}
                  onChange={(e) => setCellGroup(e.target.value)}
                  placeholder="例如：大卫牧区、约书亚区、青年区..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  擅长或常用服事岗位（可多选）
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {churchState.roles.map((r) => {
                    const isSelected = selectedRoles.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleRoleSelection(r.id)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {r.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-xs flex items-center justify-center gap-1.5"
                >
                  <UserCheck size={16} strokeWidth={2} />
                  <span>确认添加</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
