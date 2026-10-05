import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { BottomSheet } from './BottomSheet';
import {
  Clock,
  MapPin,
  Edit2,
  Check,
  Sparkles,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Plus,
} from 'lucide-react';
import type { ServiceDefinition } from '../types';

const WEEKDAYS = [
  { value: 1, zh: '星期一', en: 'Monday' },
  { value: 2, zh: '星期二', en: 'Tuesday' },
  { value: 3, zh: '星期三', en: 'Wednesday' },
  { value: 4, zh: '星期四', en: 'Thursday' },
  { value: 5, zh: '星期五', en: 'Friday' },
  { value: 6, zh: '星期六', en: 'Saturday' },
  { value: 7, zh: '星期日', en: 'Sunday' },
] as const;

interface ServiceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEditingServiceId?: string;
}

export const ServiceManagerModal: React.FC<ServiceManagerModalProps> = ({
  isOpen,
  onClose,
  initialEditingServiceId,
}) => {
  const {
    churchState,
    updateService,
    addService,
    reorderServices,
    userMode,
    language,
  } = useChurch();

  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);

  const [editingServiceId, setEditingServiceId] = useState<string | null>(
    initialEditingServiceId || null
  );

  // Form state for editing
  const [formData, setFormData] = useState<{
    name: string;
    shortName: string;
    time: string;
    rehearsalTime: string;
    venue: string;
    weekday: number;
  }>({
    name: '',
    shortName: '',
    time: '',
    rehearsalTime: '',
    venue: '',
    weekday: 7,
  });

  const handleStartEdit = (service: ServiceDefinition) => {
    setEditingServiceId(service.id);
    setFormData({
      name: service.name,
      shortName: service.shortName,
      time: service.time,
      rehearsalTime: service.rehearsalTime,
      venue: service.venue,
      weekday: service.weekday,
    });
    setIsAddingService(false);
  };

  const handleSaveEdit = (service: ServiceDefinition) => {
    if (!formData.name.trim()) return;

    const updated: ServiceDefinition = {
      ...service,
      name: formData.name.trim(),
      shortName: formData.shortName.trim() || formData.name.trim(),
      time: formData.time.trim(),
      rehearsalTime: formData.rehearsalTime.trim(),
      venue: formData.venue.trim(),
      weekday: formData.weekday,
    };

    updateService(updated);
    setEditingServiceId(null);
  };

  const handleStartAdd = () => {
    setEditingServiceId(null);
    setFormData({
      name: '',
      shortName: '',
      time: '',
      rehearsalTime: '',
      venue: '',
      weekday: 7,
    });
    setIsAddingService(true);
  };

  const handleSaveNewService = () => {
    const name = formData.name.trim();
    if (!name) return;

    const idBase = (formData.shortName.trim() || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'service';
    let id = `custom_${idBase}`;
    let suffix = 2;
    while (churchState.services.some((service) => service.id === id)) {
      id = `custom_${idBase}_${suffix}`;
      suffix += 1;
    }

    addService({
      id,
      name,
      shortName: formData.shortName.trim() || name,
      weekday: formData.weekday,
      time: formData.time.trim(),
      rehearsalTime: formData.rehearsalTime.trim(),
      venue: formData.venue.trim(),
      categoryIds: ['worship', 'media', 'pulpit', 'sundayschool', 'prayer', 'hospitality'],
    });
    setIsAddingService(false);
  };

  const handleCancelEdit = () => {
    setEditingServiceId(null);
  };

  const moveService = (serviceId: string, direction: -1 | 1) => {
    const currentIndex = churchState.services.findIndex((service) => service.id === serviceId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= churchState.services.length) return;

    const nextOrder = churchState.services.map((service) => service.id);
    [nextOrder[currentIndex], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[currentIndex]];
    reorderServices(nextOrder);
  };

  const dropService = (targetServiceId: string) => {
    if (!draggedServiceId || draggedServiceId === targetServiceId) return;

    const nextOrder = churchState.services.map((service) => service.id);
    const fromIndex = nextOrder.indexOf(draggedServiceId);
    const toIndex = nextOrder.indexOf(targetServiceId);
    if (fromIndex < 0 || toIndex < 0) return;

    nextOrder.splice(fromIndex, 1);
    nextOrder.splice(toIndex, 0, draggedServiceId);
    reorderServices(nextOrder);
    setDraggedServiceId(null);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      className="bg-slate-50 dark:bg-black"
      maxHeight="90vh"
    >
      <div className="flex flex-col h-full max-h-[85vh]">
        {/* Header */}
        <div className="px-5 pt-2 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 leading-tight">
                {language === 'zh' ? '聚会堂次与时间地点' : 'Service Schedule & Venues'}
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                {churchState.services.length} {language === 'zh' ? '堂聚会' : 'Services'}
              </p>
            </div>
            {userMode === 'editor' && (
              <button
                type="button"
                onClick={handleStartAdd}
                className="flex min-h-11 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700 active:scale-[0.98]"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>{language === 'zh' ? '新增聚会' : 'Add service'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Services List */}
        <div className="px-5 py-2 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800 flex-1">
          {isAddingService && (
            <div className="mb-3 rounded-2xl border-2 border-blue-500 bg-white p-4 shadow-sm dark:bg-zinc-900">
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-zinc-800">
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                  {language === 'zh' ? '新增聚会堂次' : 'Add service'}
                </span>
                <button type="button" onClick={() => setIsAddingService(false)} className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200">
                  {language === 'zh' ? '取消' : 'Cancel'}
                </button>
              </div>
              <div className="space-y-2.5">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-zinc-400">{language === 'zh' ? '聚会名称' : 'Service name'}</label>
                  <input autoFocus type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="例如：青年聚会" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-zinc-400">{language === 'zh' ? '简称' : 'Short name'}</label>
                    <input type="text" value={formData.shortName} onChange={(e) => setFormData({ ...formData, shortName: e.target.value })} placeholder="例如：青年" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-zinc-400">{language === 'zh' ? '每周星期' : 'Weekly day'}</label>
                    <select value={formData.weekday} onChange={(e) => setFormData({ ...formData, weekday: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                      {WEEKDAYS.map((day) => <option key={day.value} value={day.value}>{language === 'zh' ? day.zh : day.en}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-zinc-400">{language === 'zh' ? '聚会时间' : 'Service time'}</label>
                    <input type="text" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} placeholder="例如：7:30 PM" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-zinc-400">{language === 'zh' ? '地点' : 'Venue'}</label>
                    <input type="text" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} placeholder="例如：Hall 1" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={handleSaveNewService} disabled={!formData.name.trim()} className="flex min-h-11 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
                  <Check size={14} strokeWidth={2.5} />
                  <span>{language === 'zh' ? '新增并保存' : 'Add and save'}</span>
                </button>
              </div>
            </div>
          )}
          {churchState.services.map((svc) => {
            const isEditing = editingServiceId === svc.id;

            if (isEditing) {
              return (
                <div
                  key={svc.id}
                  className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-blue-500 dark:border-blue-500/80 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Sparkles size={14} />
                      <span>{language === 'zh' ? '编辑聚会堂次' : 'Edit Service'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                    >
                      {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 block mb-1">
                        {language === 'zh' ? '聚会名称' : 'Service Name'}
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="例如：Fire4J"
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 block mb-1">
                          {language === 'zh' ? '简称 (Tab标签)' : 'Short Name'}
                        </label>
                        <input
                          type="text"
                          value={formData.shortName}
                          onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                          placeholder="例如：Fire4J"
                          className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 block mb-1">
                          {language === 'zh' ? '每周星期' : 'Weekly day'}
                        </label>
                        <select
                          value={formData.weekday}
                          onChange={(e) => setFormData({ ...formData, weekday: Number(e.target.value) })}
                          className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {WEEKDAYS.map((day) => <option key={day.value} value={day.value}>{language === 'zh' ? day.zh : day.en}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 block mb-1">
                        {language === 'zh' ? '聚会时间' : 'Service Time'}
                      </label>
                      <input
                        type="text"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        placeholder="例如：7:30 PM"
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 block mb-1">
                        {language === 'zh' ? '彩排调音时间' : 'Rehearsal Time'}
                      </label>
                      <input
                        type="text"
                        value={formData.rehearsalTime}
                        onChange={(e) => setFormData({ ...formData, rehearsalTime: e.target.value })}
                        placeholder="例如：6:15 PM 彩排调音"
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 block mb-1">
                        {language === 'zh' ? '场地地点' : 'Venue'}
                      </label>
                      <input
                        type="text"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        placeholder="例如：Hall 1 / Hall 2"
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    >
                      {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(svc)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Check size={14} strokeWidth={2.5} />
                      <span>{language === 'zh' ? '保存更改' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              );
            }

            const serviceIndex = churchState.services.findIndex((service) => service.id === svc.id);

            return (
              <div
                key={svc.id}
                draggable={userMode === 'editor'}
                onDragStart={() => setDraggedServiceId(svc.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => dropService(svc.id)}
                onDragEnd={() => setDraggedServiceId(null)}
                className={`py-3.5 space-y-1.5 transition-opacity ${draggedServiceId === svc.id ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    {userMode === 'editor' && (
                      <GripVertical size={15} className="shrink-0 cursor-grab text-slate-400 dark:text-zinc-500" aria-label={language === 'zh' ? '拖动调整顺序' : 'Drag to reorder'} />
                    )}
                    <h3 className="truncate font-bold text-sm text-slate-900 dark:text-zinc-100">
                      {svc.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300 font-mono">
                      {svc.time}
                    </span>

                    {/* Edit action button - only visible in admin/editor mode */}
                    {userMode === 'editor' && (
                      <>
                        <button
                          type="button"
                          onClick={() => moveService(svc.id, -1)}
                          disabled={serviceIndex === 0}
                          aria-label={language === 'zh' ? `将${svc.shortName || svc.name}上移` : `Move ${svc.shortName || svc.name} up`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-blue-300"
                        >
                          <ChevronUp size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveService(svc.id, 1)}
                          disabled={serviceIndex === churchState.services.length - 1}
                          aria-label={language === 'zh' ? `将${svc.shortName || svc.name}下移` : `Move ${svc.shortName || svc.name} down`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-blue-300"
                        >
                          <ChevronDown size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(svc)}
                          title={language === 'zh' ? '编辑此堂次信息' : 'Edit service details'}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Edit2 size={13} strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Clock size={12} strokeWidth={2} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                    <span>
                      {language === 'zh' ? '彩排' : 'Rehearsal'}: {svc.rehearsalTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 text-center text-[10px] font-bold text-slate-400 dark:text-zinc-500">{language === 'zh' ? '周' : 'Day'}</span>
                    <span>{WEEKDAYS.find((day) => day.value === svc.weekday)?.[language === 'zh' ? 'zh' : 'en']}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={12} strokeWidth={2} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                    <span>
                      {language === 'zh' ? '地点' : 'Venue'}: {svc.venue}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
};
