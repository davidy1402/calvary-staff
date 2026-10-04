import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { BottomSheet } from './BottomSheet';
import {
  Clock,
  MapPin,
  Edit2,
  Check,
  Sparkles,
} from 'lucide-react';
import type { ServiceDefinition } from '../types';

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
    userMode,
    setUserMode,
    language,
  } = useChurch();

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
  }>({
    name: '',
    shortName: '',
    time: '',
    rehearsalTime: '',
    venue: '',
  });

  const handleStartEdit = (service: ServiceDefinition) => {
    setEditingServiceId(service.id);
    setFormData({
      name: service.name,
      shortName: service.shortName,
      time: service.time,
      rehearsalTime: service.rehearsalTime,
      venue: service.venue,
    });
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
    };

    updateService(updated);
    setEditingServiceId(null);
  };

  const handleCancelEdit = () => {
    setEditingServiceId(null);
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
          </div>
        </div>

        {/* Services List */}
        <div className="px-5 py-2 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800 flex-1">
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
                        placeholder="例如：青年中心 Youth Center"
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

            return (
              <div
                key={svc.id}
                className="py-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                    {svc.name}
                  </h3>

                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300 font-mono">
                      {svc.time}
                    </span>

                    {/* Edit action button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (userMode !== 'editor') {
                          setUserMode('editor');
                        }
                        handleStartEdit(svc);
                      }}
                      title={language === 'zh' ? '编辑此堂次信息' : 'Edit service details'}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Edit2 size={13} strokeWidth={2} />
                    </button>
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
