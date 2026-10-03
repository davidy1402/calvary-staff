import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { Music, Plus, Trash2, Check, X, ChevronDown, ChevronUp, Play, Video } from 'lucide-react';
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
  const [category, setCategory] = useState('快歌');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [notes, setNotes] = useState('');

  const keyPresets = ['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'Em', 'C-D', 'D-G', 'Bb-C'];
  const categoryPresets = ['快歌', '慢歌', '回应'];

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addSong(
      {
        title: title.trim(),
        key: key.trim(),
        category,
        youtubeUrl: youtubeUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      date,
      serviceId
    );

    setTitle('');
    setYoutubeUrl('');
    setNotes('');
    setIsAdding(false);
  };

  return (
    <div className="bg-slate-50/90 dark:bg-zinc-900/60 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden mb-3.5">
      {/* Section Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-100/80 dark:bg-zinc-800 text-blue-800 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Music size={14} strokeWidth={2} />
          </div>
          <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            {language === 'zh' ? '敬拜赞美歌单' : 'Worship Setlist'}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-zinc-700">
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
              className="text-xs font-bold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200 flex items-center gap-1 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 px-2 py-0.5 rounded-md hover:bg-blue-50 dark:hover:bg-zinc-700 transition-colors active:scale-95 shadow-2xs"
            >
              <Plus size={12} strokeWidth={2.5} />
              <span>{language === 'zh' ? '加诗歌' : 'Add'}</span>
            </button>
          )}
          <div className="text-slate-400 dark:text-zinc-500">
            {isExpanded ? <ChevronUp size={16} strokeWidth={2} /> : <ChevronDown size={16} strokeWidth={2} />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3.5 pb-3 pt-1 border-t border-slate-200/50 dark:border-zinc-800 space-y-2">
          {/* Song List Items */}
          {songs.length === 0 && !isAdding ? (
            <div className="py-3 text-center text-slate-400 dark:text-zinc-500 text-xs">
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
            <div className="space-y-2 pt-1">
              {songs.map((song, idx) => (
                <div
                  key={song.id}
                  className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-zinc-500 w-4 text-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                        {song.title}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {song.key && (
                          <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-zinc-800 text-blue-900 dark:text-blue-300 border border-blue-200/80 dark:border-zinc-700">
                            Key {song.key}
                          </span>
                        )}

                        {song.category && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              song.category === '快歌'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-900/50'
                                : song.category === '慢歌'
                                ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-900/50'
                                : song.category === '回应'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-900/50'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700'
                            }`}
                          >
                            {song.category}
                          </span>
                        )}

                        {song.notes && (
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                            ({song.notes})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {song.youtubeUrl ? (
                      <a
                        href={song.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="在 YouTube 试听官方练习曲或 MV"
                        aria-label="在 YouTube 试听"
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-zinc-700 active:scale-95 text-red-600 dark:text-red-400 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-2xs transition-all cursor-pointer"
                      >
                        <Play size={12} className="fill-current ml-0.5" />
                      </a>
                    ) : isEditMode ? (
                      <button
                        type="button"
                        onClick={() => {
                          const url = window.prompt(`为《${song.title}》输入 YouTube 链接:`, song.youtubeUrl || '');
                          if (url !== null && url.trim()) {
                            addSong({ ...song, youtubeUrl: url.trim() }, date, serviceId);
                          }
                        }}
                        title="添加 YouTube 试听链接"
                        aria-label="添加 YouTube 试听链接"
                        className="w-7 h-7 rounded-lg bg-red-50 dark:bg-zinc-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-zinc-700 flex items-center justify-center border border-red-200 dark:border-zinc-700 transition-colors cursor-pointer"
                      >
                        <Plus size={13} strokeWidth={2.5} />
                      </button>
                    ) : null}

                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => removeSong(song.id, date, serviceId)}
                        title="删除诗歌"
                        className="text-slate-300 dark:text-zinc-600 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Song Inline Form */}
          {isAdding && (
            <form onSubmit={handleAddSong} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-blue-200 dark:border-zinc-700 space-y-2.5 shadow-xs animate-slide-up mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  {language === 'zh' ? '添加诗歌' : 'Add Song'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'zh' ? '诗歌名称 (例如: Yes Amen！ 是你的应许)' : 'Song Title'}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-900 dark:text-zinc-100"
                  autoFocus
                />
              </div>

              {/* Key Selector Chips */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1">
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
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selector Chips */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1">
                  {language === 'zh' ? '曲风 / 环节' : 'Category'}
                </label>
                <div className="flex items-center gap-1.5">
                  {categoryPresets.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                        category === cat
                          ? 'bg-slate-800 dark:bg-zinc-200 text-white dark:text-zinc-900 border-slate-800 dark:border-zinc-200'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* YouTube Link Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Video size={12} className="text-red-500" />
                  <span>{language === 'zh' ? 'YouTube 链接 (选填)' : 'YouTube Link (optional)'}</span>
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtu.be/..."
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-zinc-300 font-mono"
                />
              </div>

              {/* Notes input */}
              <div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'zh' ? '备注 (选填)' : 'Optional notes'}
                  className="w-full text-xs px-2.5 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-zinc-300"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                >
                  {language === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
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
