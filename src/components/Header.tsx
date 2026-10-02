import React from 'react';
import { useChurch } from '../context/ChurchContext';
import { Calendar, ChevronLeft, ChevronRight, Church } from 'lucide-react';
import { formatDateLabel } from '../utils/dateUtils';

export const Header: React.FC = () => {
  const {
    churchState,
    activeServiceId,
    setActiveServiceId,
    selectedDate,
    setSelectedDate,
  } = useChurch();

  const handlePrevWeek = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 7);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleNextWeek = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 7);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-2xl mx-auto px-4 py-3">
        {/* Church Title Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Church size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                {churchState.churchName}
              </h1>
              <p className="text-xs text-slate-500 font-medium">同工服事与排班看板 · 马来西亚柔佛</p>
            </div>
          </div>
          <div className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            加略山专属版
          </div>
        </div>

        {/* Service Switcher Tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar mt-3 pb-1 -mx-1 px-1">
          {churchState.services.map((svc) => {
            const isActive = svc.id === activeServiceId;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => setActiveServiceId(svc.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{svc.name}</span>
              </button>
            );
          })}
        </div>

        {/* Date Selector Row */}
        <div className="mt-2.5 flex items-center justify-between bg-slate-50 rounded-xl p-1.5 border border-slate-200/80">
          <button
            type="button"
            onClick={handlePrevWeek}
            aria-label="前一周聚会"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
          >
            <ChevronLeft size={18} strokeWidth={1.75} />
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Calendar size={16} strokeWidth={1.75} className="text-blue-600" />
            <span>{formatDateLabel(selectedDate)}</span>
          </div>

          <button
            type="button"
            onClick={handleNextWeek}
            aria-label="下一周聚会"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
          >
            <ChevronRight size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
};
