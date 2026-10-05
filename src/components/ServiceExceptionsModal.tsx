import React, { useMemo, useState } from 'react';
import { CalendarOff, Info, Trash2 } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { useChurch } from '../context/ChurchContext';

interface ServiceExceptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export const ServiceExceptionsModal: React.FC<ServiceExceptionsModalProps> = ({ isOpen, onClose, serviceId }) => {
  const { activeService, getServiceExceptions, saveServiceException, removeServiceException, language } = useChurch();
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState<'cancelled' | 'notice'>('cancelled');
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState('');
  const exceptions = useMemo(() => getServiceExceptions(serviceId).filter((item) => item.date >= today()), [getServiceExceptions, serviceId]);
  const isZh = language === 'zh';

  const save = () => {
    if (!date) return;
    if (status === 'cancelled' && !note.trim()) {
      setValidationError(isZh ? '请填写暂停原因，让会友知道当天不需要前来。' : 'Add a reason so members know the service is paused.');
      return;
    }
    saveServiceException({ serviceId, date, status, note: note.trim() || undefined });
    setNote('');
    setValidationError('');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="bg-slate-50 dark:bg-black" maxHeight="90dvh" labelledBy="service-exceptions-title">
      <div className="flex flex-col max-h-[82dvh]">
        <div className="px-5 pt-2 pb-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <CalendarOff size={20} />
            </div>
            <div>
              <h2 id="service-exceptions-title" className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                {isZh ? '例外日期与假期提示' : 'Date exceptions & holiday notices'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">{activeService.name}</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 overflow-y-auto space-y-5">
          <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 space-y-3">
            <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
              {isZh ? '固定每周聚会会自动显示；这里只记录某一天的暂停或提醒，不会建立空白排班。' : 'Weekly services appear automatically. Add only a one-day closure or notice here; no empty roster is created.'}
            </p>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
              {isZh ? '日期' : 'Date'}
              <input type="date" min={today()} value={date} onChange={(event) => setDate(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm text-slate-900 dark:text-zinc-100" />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStatus('cancelled')} className={`min-h-12 rounded-xl px-3 text-xs font-bold border ${status === 'cancelled' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'}`}>
                {isZh ? '暂停聚会' : 'Service paused'}
              </button>
              <button type="button" onClick={() => setStatus('notice')} className={`min-h-12 rounded-xl px-3 text-xs font-bold border ${status === 'notice' ? 'bg-blue-700 text-white border-blue-700' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'}`}>
                {isZh ? '照常举行＋提示' : 'On as planned + notice'}
              </button>
            </div>

            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
              {isZh ? '说明' : 'Message'}
              <input type="text" value={note} onChange={(event) => { setNote(event.target.value); setValidationError(''); }} placeholder={status === 'cancelled' ? (isZh ? '例如：圣诞假期' : 'e.g. Christmas break') : (isZh ? '例如：公共假期，聚会照常' : 'e.g. Public holiday; service continues')} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm text-slate-900 dark:text-zinc-100" />
            </label>
            {validationError && <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">{validationError}</p>}
            <button type="button" onClick={save} className="min-h-11 w-full rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold active:scale-[0.99]">
              {isZh ? '保存日期设定' : 'Save date setting'}
            </button>
          </section>

          <section>
            <h3 className="px-1 mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-zinc-400">{isZh ? '未来例外日期' : 'Upcoming exceptions'}</h3>
            {exceptions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 px-4 py-5 text-center text-xs text-slate-500 dark:text-zinc-400">
                {isZh ? '还没有例外日期。每周聚会会照常自动显示。' : 'No exceptions yet. The weekly service will appear as usual.'}
              </div>
            ) : (
              <div className="space-y-2">
                {exceptions.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
                    {item.status === 'cancelled' ? <CalendarOff size={18} className="text-rose-600 dark:text-rose-400 shrink-0" /> : <Info size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">{item.date} · {item.status === 'cancelled' ? (isZh ? '暂停聚会' : 'Paused') : (isZh ? '照常举行' : 'On as planned')}</p>
                      {item.note && <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 break-words">{item.note}</p>}
                    </div>
                    <button type="button" onClick={() => removeServiceException(item.date, item.serviceId)} aria-label={isZh ? '移除此日期设定' : 'Remove date setting'} className="min-h-11 min-w-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </BottomSheet>
  );
};
