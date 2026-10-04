import React, { useId, useMemo, useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { BottomSheet } from './BottomSheet';
import { Search, X, Check, ChevronRight, UserPlus, ArrowLeft } from 'lucide-react';

interface IdentitySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  canDismiss?: boolean;
}

export const IdentitySelectModal: React.FC<IdentitySelectModalProps> = ({
  isOpen,
  onClose,
  canDismiss = true,
}) => {
  const { churchState, currentUserId, selectIdentity, addCoworker, language } = useChurch();
  const [search, setSearch] = useState('');
  const [pendingIdentity, setPendingIdentity] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEnglishName, setRegEnglishName] = useState('');
  const [regCellGroup, setRegCellGroup] = useState('职青');
  const [regError, setRegError] = useState('');
  const id = useId();
  const zh = language === 'zh';

  const coworkers = useMemo(
    () =>
      churchState.coworkers
        .filter((c) => c.active)
        .sort((a, b) => {
          if (a.id === currentUserId) return -1;
          if (b.id === currentUserId) return 1;
          return a.name.localeCompare(b.name, 'zh-CN');
        }),
    [churchState.coworkers, currentUserId]
  );

  const filtered = coworkers.filter((c) =>
    [c.name, c.englishName, c.cellGroup].some((value) =>
      value.toLowerCase().includes(search.trim().toLowerCase())
    )
  );

  const choose = (cwId: string) => {
    if (pendingIdentity !== null) return;
    // Keep the list and underlying screen steady until the sheet has left.
    setPendingIdentity(cwId);
  };

  const finishClose = () => {
    if (pendingIdentity !== null) selectIdentity(pendingIdentity);
    setPendingIdentity(null);
    setSearch('');
    setIsRegistering(false);
    onClose();
  };

  const handleStartRegister = (prefill = '') => {
    setRegName(prefill || search.trim());
    setRegEnglishName('');
    setRegCellGroup('职青');
    setRegError('');
    setIsRegistering(true);
  };

  const handleConfirmRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = regName.trim();
    if (!clean) {
      setRegError(zh ? '请输入姓名' : 'Please enter name');
      return;
    }
    const created = addCoworker({
      name: clean,
      englishName: regEnglishName.trim(),
      phone: '',
      cellGroup: regCellGroup,
      qualifiedRoleIds: [],
      active: true,
    });
    choose(created.id);
  };

  return (
    <BottomSheet
      isOpen={isOpen && pendingIdentity === null}
      onClose={onClose}
      onAfterClose={finishClose}
      dismissible={canDismiss}
      labelledBy={`${id}-title`}
      maxHeight="min(90dvh, 760px)"
    >
      {isRegistering ? (
        <div className="identity-content flex flex-col min-h-0" key="register">
          <div className="px-5 pb-3 pt-1 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className="p-1 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer"
              aria-label={zh ? '返回' : 'Back'}
            >
              <ArrowLeft size={20} />
            </button>
            <h2 id={`${id}-title`} className="text-base font-bold text-slate-900 dark:text-zinc-100">
              {zh ? '登记为服侍人员' : 'Register as Volunteer'}
            </h2>
            <div className="w-6" />
          </div>

          <form onSubmit={handleConfirmRegister} className="p-5 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                {zh ? '姓名 (必填)' : 'Name (Required)'}
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => {
                  setRegName(e.target.value);
                  setRegError('');
                }}
                placeholder={zh ? '如：家豪、美华' : 'e.g. John Doe'}
                className="w-full min-h-11 px-3.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                autoFocus
              />
              {regError && <p className="text-xs text-rose-500 mt-1">{regError}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                {zh ? '英文名 / 昵称 (选填)' : 'English Name (Optional)'}
              </label>
              <input
                type="text"
                value={regEnglishName}
                onChange={(e) => setRegEnglishName(e.target.value)}
                placeholder={zh ? '如：David, Sarah' : 'e.g. David'}
                className="w-full min-h-11 px-3.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                {zh ? '所属团契 / 牧区' : 'Group / Fellowship'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['职青', '大专', '青少年', '同工'].map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setRegCellGroup(grp)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                      regCellGroup === grp
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="flex-1 min-h-11 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                {zh ? '取消' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 min-h-11 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                {zh ? '确认登记并进入' : 'Confirm & Enter'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="identity-content flex flex-col min-h-0" key="select">
          <div className="px-5 pb-4 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <h2
                id={`${id}-title`}
                tabIndex={-1}
                data-sheet-initial-focus
                className="text-xl font-bold text-slate-900 dark:text-zinc-100 focus:outline-none"
              >
                {zh ? '平安！请问您的名字是？' : 'Welcome! Select Your Name'}
              </h2>
              {canDismiss && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={zh ? '关闭' : 'Close'}
                  className="min-h-11 min-w-11 rounded-xl flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400 mt-2">
              {zh
                ? '选择自己的名字，查看您的服侍安排与诗歌歌单。'
                : 'Choose your name to see your duties and setlists.'}
            </p>
            <div className="relative mt-4">
              <Search
                size={18}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label={zh ? '搜索服侍人员' : 'Search volunteers'}
                placeholder={zh ? '搜索姓名、英文名或小组' : 'Search name or group'}
                className="w-full min-h-12 pl-10 pr-12 rounded-xl border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-base text-slate-900 dark:text-zinc-100 placeholder:text-slate-500 dark:placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label={zh ? '清除搜索' : 'Clear search'}
                  className="absolute right-1 top-1 min-h-10 min-w-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-zinc-400 cursor-pointer"
                >
                  <X size={17} />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto overscroll-contain min-h-0 px-5 pb-3">
            {!search.trim() && (
              <div className="pb-3">
                <button
                  type="button"
                  onClick={() => handleStartRegister()}
                  className="w-full text-center py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-center gap-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <UserPlus size={13} />
                  <span>{zh ? '新加入服侍？登记姓名加入名单' : 'New volunteer? Register your name'}</span>
                </button>
              </div>
            )}

            <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 pb-2">
              {zh
                ? search.trim()
                  ? `找到 ${filtered.length} 位服侍人员`
                  : '所有服侍人员'
                : `${filtered.length} volunteers`}
            </p>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => choose(c.id)}
                  aria-pressed={(pendingIdentity ?? currentUserId) === c.id}
                  className="press-feedback w-full min-h-16 flex items-center gap-3 py-3 text-left rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {c.avatar ? (
                    <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-slate-700 dark:text-zinc-200 font-semibold">
                      {c.name.slice(0, 1)}
                    </span>
                  )}
                  <span className="flex-1 min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-base font-medium text-slate-900 dark:text-zinc-100">
                        {c.name}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-zinc-400">{c.englishName}</span>
                    </span>
                    <span className="block text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                      {c.cellGroup}
                    </span>
                  </span>
                  {(pendingIdentity ?? currentUserId) === c.id && (
                    <Check size={20} className="text-blue-700 dark:text-blue-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {!filtered.length && (
              <div role="status" className="py-7 text-center space-y-3">
                <p className="text-sm text-slate-700 dark:text-zinc-300">
                  {zh ? `名单中暂无「${search.trim()}」` : `No matching coworker for "${search.trim()}"`}
                </p>
                <div className="flex flex-col gap-2 max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={() => handleStartRegister(search.trim())}
                    className="min-h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus size={14} />
                    <span>{zh ? `我是新服侍人员，登记「${search.trim()}」` : `Register "${search.trim()}"`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => choose('cw_guest')}
                    className="min-h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {zh ? '先以访客身份浏览' : 'Browse as a guest'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="px-5 pt-3 pb-safe-bottom border-t border-slate-200 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => choose('cw_guest')}
              className="w-full min-h-12 flex items-center justify-between px-3 rounded-xl text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <span>{zh ? '不在名单上？以访客身份浏览' : 'Browse as a guest'}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
};
