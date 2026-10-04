import React, { useState, useMemo } from 'react';
import { useChurch } from '../context/ChurchContext';
import type { RoleDefinition } from '../types';
import { Search, Star, User, Send } from 'lucide-react';
import { RosterSaveStatus, RosterUndoNotice } from './RosterSaveStatus';
import { BottomSheet } from './BottomSheet';
import { t } from '../utils/i18n';
import { generateWhatsAppDutyChangeText, getWhatsAppShareUrl } from '../utils/whatsappFormatter';

interface AssignModalProps {
  role: RoleDefinition;
  isOpen: boolean;
  onClose: () => void;
  targetDate?: string;
  targetServiceId?: string;
  showNoteEditor?: boolean;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  role,
  isOpen,
  onClose,
  targetDate,
  targetServiceId,
  showNoteEditor = false,
}) => {
  const {
    churchState,
    selectedDate,
    activeServiceId,
    assignCoworker,
    removeAssignment,
    updateDutyNote,
    language,
  } = useChurch();
  const [search, setSearch] = useState('');

  const [lastChange, setLastChange] = useState<{
    coworkerName: string;
    coworkerId: string;
    previousName?: string;
    action: 'assigned' | 'removed';
  } | null>(null);

  const effectiveDate = targetDate || selectedDate;
  const effectiveServiceId = targetServiceId || activeServiceId;
  const rosterKey = `${effectiveDate}_${effectiveServiceId}`;
  const targetRoster = churchState.rosters[rosterKey];
  const targetService = churchState.services.find((s) => s.id === effectiveServiceId);
  const [note, setNote] = useState(() => targetRoster?.dutyNotes?.[role.id] || '');
  const saveNote = () => {
    if (showNoteEditor && note !== (targetRoster?.dutyNotes?.[role.id] || '')) {
      updateDutyNote(role.id, note, effectiveDate, effectiveServiceId);
    }
  };
  const handleClose = () => {
    saveNote();
    onClose();
  };

  // Identify worship leader (lead_vocal) for this service
  const leadVocalIds = targetRoster?.assignments?.['lead_vocal'] || [];
  const leadVocalCoworkers = churchState.coworkers.filter((c) => leadVocalIds.includes(c.id));
  const leadVocalNames = leadVocalCoworkers.map((c) => c.name).join('、');
  const leadVocalPrimary = leadVocalCoworkers[0];

  const handleNotifyLeader = () => {
    if (!lastChange) return;
    const serviceName = targetService?.name || '主日崇拜';
    const text = generateWhatsAppDutyChangeText({
      date: effectiveDate,
      serviceName,
      roleName: role.name,
      previousCoworkerName: lastChange.previousName,
      newCoworkerName: lastChange.action === 'assigned' ? lastChange.coworkerName : '（已调整请假）',
      leaderName: leadVocalNames || undefined,
    });

    const url = getWhatsAppShareUrl(text, leadVocalPrimary?.phone);
    window.open(url, '_blank');
  };

  const assignedIds = useMemo(() => {
    return targetRoster?.assignments?.[role.id] || [];
  }, [targetRoster?.assignments, role.id]);

  const filteredCoworkers = useMemo(() => {
    return churchState.coworkers.filter((cw) => {
      if (!cw.active) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        cw.name.toLowerCase().includes(q) ||
        cw.englishName.toLowerCase().includes(q) ||
        cw.cellGroup.toLowerCase().includes(q)
      );
    });
  }, [churchState.coworkers, search]);

  // Sort coworkers: already assigned first, then qualified/recommended, then others
  const sortedCoworkers = useMemo(() => {
    return [...filteredCoworkers].sort((a, b) => {
      const aAssigned = assignedIds.includes(a.id);
      const bAssigned = assignedIds.includes(b.id);
      if (aAssigned && !bAssigned) return -1;
      if (!aAssigned && bAssigned) return 1;

      const aQualified = a.qualifiedRoleIds.includes(role.id);
      const bQualified = b.qualifiedRoleIds.includes(role.id);
      if (aQualified && !bQualified) return -1;
      if (!aQualified && bQualified) return 1;

      return a.name.localeCompare(b.name, 'zh-CN');
    });
  }, [filteredCoworkers, assignedIds, role.id]);

  if (!isOpen) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} className="bg-white dark:bg-zinc-900" maxHeight="88vh">
      <div className="px-4 pb-3 pt-0.5 border-b border-slate-100 dark:border-zinc-800 shrink-0 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            {showNoteEditor ? (language === 'zh' ? '编辑岗位' : 'Edit role') : t('assignRole', language)} {role.name}
          </h2>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400 mt-1">
            {effectiveDate} {targetService?.name}
          </p>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            {language === 'zh' ? '点击同工可选取或移除' : 'Tap a person to assign or remove.'}
          </p>
        </div>
        <button type="button" onClick={handleClose} className="min-h-11 px-3 rounded-lg text-sm font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 shrink-0">
          {t('done', language)}
        </button>
      </div>

      {showNoteEditor && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
            {language === 'zh' ? '服事备注' : 'Duty note'}
            <textarea
              aria-label={language === 'zh' ? '服事备注' : 'Duty note'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={saveNote}
              rows={2}
              placeholder={language === 'zh' ? '准备事项或提醒，可留空' : 'Preparation or reminders (optional)'}
              className="mt-2 w-full resize-y rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm leading-relaxed text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      )}

      <div className="px-4 py-1"><RosterSaveStatus /></div>

      {/* Search Bar */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200/70 dark:border-zinc-800 shrink-0">
        <div className="relative">
          <Search
            size={15}
            strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
          />
          <input
            type="text"
            aria-label={t('searchCoworker', language)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchCoworker', language)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Coworkers List */}
      <div className="overflow-y-auto p-4 space-y-2 flex-1 divide-y divide-slate-100 dark:divide-zinc-800 pb-8 sm:pb-6">
        {sortedCoworkers.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 dark:text-zinc-500">
            {t('noCoworkerFound', language)}
          </div>
        ) : (
          sortedCoworkers.map((cw) => {
            const isAssigned = assignedIds.includes(cw.id);
            const isQualified = cw.qualifiedRoleIds.includes(role.id);

            return (
              <button
                type="button"
                aria-pressed={isAssigned}
                key={cw.id}
                onClick={() => {
                  if (isAssigned) {
                    removeAssignment(role.id, cw.id, effectiveDate, effectiveServiceId);
                    setLastChange({
                      coworkerName: cw.name,
                      coworkerId: cw.id,
                      action: 'removed',
                    });
                  } else {
                    const previousCoworker =
                      assignedIds.length > 0
                        ? churchState.coworkers.find((c) => c.id === assignedIds[0])?.name
                        : undefined;
                    assignCoworker(role.id, cw.id, effectiveDate, effectiveServiceId);
                    setLastChange({
                      coworkerName: cw.name,
                      coworkerId: cw.id,
                      previousName: previousCoworker,
                      action: 'assigned',
                    });
                  }
                }}
                className={`w-full text-left min-h-14 pt-2.5 pb-2.5 px-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isAssigned
                    ? 'bg-blue-50/80 dark:bg-zinc-800 border border-blue-300 dark:border-zinc-600'
                    : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {cw.avatar ? (
                    <img
                      src={cw.avatar}
                      alt={cw.name}
                      className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0 ${
                        isAssigned
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      {cw.name.slice(0, 1) || <User size={16} strokeWidth={1.75} />}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        {cw.name}
                      </span>
                      {cw.englishName && (
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                          ({cw.englishName})
                        </span>
                      )}
                      {isQualified && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
                          <Star size={10} strokeWidth={2} />
                          {t('regularRole', language)}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 dark:text-zinc-400">
                        {cw.cellGroup}
                      </span>
                    </div>
                  </div>
                </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      isAssigned
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                    }`}
                  >
                    {isAssigned && <span className="text-xs font-bold leading-none">✓</span>}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Quick WhatsApp Notification for Leader & Team */}
        {lastChange && (assignedIds.includes(lastChange.coworkerId) === (lastChange.action === 'assigned')) && (
          <div className="px-4 py-3 bg-blue-50/95 dark:bg-zinc-800/95 border-t border-blue-200/80 dark:border-zinc-700 flex items-center justify-between gap-3 shrink-0 animate-slide-up">
            <div className="min-w-0">
              <p className="text-xs font-bold text-blue-900 dark:text-zinc-100 truncate">
                {lastChange.action === 'assigned'
                  ? `已指派: ${lastChange.coworkerName}`
                  : `已移除: ${lastChange.coworkerName}`}
              </p>
              <p className="text-[10px] text-blue-700 dark:text-zinc-400 truncate">
                {leadVocalNames
                  ? `本次领诗：${leadVocalNames}`
                  : (language === 'zh' ? '可直接发送异动通知' : 'Ready to notify team')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleNotifyLeader}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
              title={language === 'zh' ? '通过 WhatsApp 立即通知领诗或服事群' : 'Notify via WhatsApp'}
            >
              <Send size={12} strokeWidth={2.2} />
              <span>{leadVocalNames ? `通知领诗` : (language === 'zh' ? '发异动通知' : 'Notify')}</span>
            </button>
          </div>
        )}
        <RosterUndoNotice inline />
      </BottomSheet>
  );
};
