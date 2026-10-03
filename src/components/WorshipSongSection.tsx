import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { Music, Plus, Trash2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { WorshipSong } from '../types';

interface WorshipSongSectionProps {
  date: string;
  serviceId: string;
  songs?: WorshipSong[];
}

export const WorshipSongSection: React.FC<WorshipSongSectionProps> = ({
  date,
  serviceId,
  songs = [],
}) => {
  const { isEditMode, addSong, removeSong, language } = useChurch();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // New song form state
  const [title, setTitle] = useState('');
  const [key, setKey] = useState('G');
  const [category, setCategory] = useState('赞美');
  const [notes, setNotes] = useState('');

  const keyPresets = ['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Em'];
  const categoryPresets = ['赞美', '敬拜', '回应'];

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addSong(
      {
        title: title.trim(),
        key: key.trim(),
        category,
        notes: notes.trim() || undefined,
      },
      date,
      serviceId
    );

    setTitle('');
    setNotes('');
    setIsAdding(false);
  };

  return (
    <div className="bg-slate-50/90 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden mb-3.5">
      {/* Section Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 flex items-center justify-center shrink-0">
            <Music size={14} strokeWidth={2} />
          </div>
          <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {language === 'zh' ? '敬拜赞美歌单' : 'Worship Setlist'}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
            {songs.length} {language === 'zh' ? '首' : 'songs'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && isExpanded && !isAdding && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAdding(true);
              }}
              className="text-xs font-bold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200 flex items-center gap-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors active:scale-95 shadow-2xs"
            >
              <Plus size={12} strokeWidth={2.5} />
              <span>{language === 'zh' ? '加诗歌' : 'Add'}</span>
            </button>
          )}
          <div className="text-slate-400 dark:text-slate-500">
            {isExpanded ? <ChevronUp size={16} strokeWidth={2} /> : <ChevronDown size={16} strokeWidth={2} />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3.5 pb-3 pt-1 border-t border-slate-200/50 dark:border-slate-800 space-y-2">
          {/* Song List Items */}
          {songs.length === 0 && !isAdding ? (
            <div className="py-3 text-center text-slate-400 dark:text-slate-500 text-xs">
              <span>{language === 'zh' ? '尚未录入本周诗歌' : 'No songs added for this service'}</span>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="block mx-auto mt-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + {language === 'zh' ? '点击添加第一首诗歌' : 'Add first song'}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1.5 pt-1">
              {songs.map((song, idx) => (
                <div
                  key={song.id}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 w-4 text-center shrink-0">
                      {idx + 1}
                    </span>

                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {song.title}
                    </span>

                    {song.key && (
                      <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shrink-0">
                        Key {song.key}
                      </span>
                    )}

                    {song.category && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                        {song.category}
                      </span>
                    )}

                    {song.notes && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate hidden sm:inline">
                        ({song.notes})
                      </span>
                    )}
                  </div>

                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => removeSong(song.id, date, serviceId)}
                      title="删除诗歌"
                      className="text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Song Inline Form */}
          {isAdding && (
            <form onSubmit={handleAddSong} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-900 space-y-2.5 shadow-xs animate-slide-up mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {language === 'zh' ? '添加诗歌' : 'Add Song'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'zh' ? '诗歌名称 (例如: 献上感恩)' : 'Song Title'}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-900 dark:text-slate-100"
                  autoFocus
                />
              </div>

              {/* Key Selector Chips */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {language === 'zh' ? '调性 (Key)' : 'Key'}
                </label>
                <div className="flex items-center gap-1 flex-wrap">
                  {keyPresets.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKey(k)}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        key === k
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selector Chips */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {language === 'zh' ? '环节' : 'Category'}
                </label>
                <div className="flex items-center gap-1.5">
                  {categoryPresets.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                        category === cat
                          ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes input */}
              <div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'zh' ? '备注 (例如: 进门诗歌、轻快)' : 'Optional notes'}
                  className="w-full text-xs px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  {language === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Check size={12} strokeWidth={2.5} />
                  <span>{language === 'zh' ? '保存' : 'Save'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
