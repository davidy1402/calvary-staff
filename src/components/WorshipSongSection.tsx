import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { Music, Plus, Trash2, Check, X, ChevronDown, ChevronUp, Play, Video, Edit2 } from 'lucide-react';
import type { WorshipSong } from '../types';

interface WorshipSongSectionProps {
  date: string;
  serviceId: string;
  songs?: WorshipSong[];
  allowEdit?: boolean;
  initiallyExpanded?: boolean;
}

export const WorshipSongSection: React.FC<WorshipSongSectionProps> = ({
  date,
  serviceId,
  songs = [],
  allowEdit = false,
  initiallyExpanded = false,
}) => {
  const { isEditMode, addSong, updateSong, removeSong, language } = useChurch();
  const canEdit = isEditMode || allowEdit;
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);

  // New song form state
  const [title, setTitle] = useState('');
  const [key, setKey] = useState('');
  const [category, setCategory] = useState('快歌');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [notes, setNotes] = useState('');

  const categoryPresets = ['快歌', '慢歌', '回应'];

  const resetForm = () => {
    setTitle('');
    setKey('');
    setCategory('快歌');
    setYoutubeUrl('');
    setNotes('');
    setEditingSongId(null);
    setIsAdding(false);
  };

  const startAdding = () => {
    resetForm();
    setIsExpanded(true);
    setIsAdding(true);
  };

  const handleSaveSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !title.trim()) return;
    const song = {
      title: title.trim(),
      key: key.trim(),
      category,
      youtubeUrl: youtubeUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    if (editingSongId) {
      updateSong(editingSongId, song, date, serviceId);
    } else {
      addSong(song, date, serviceId);
    }
    resetForm();
  };

  return (
    <div className="rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 p-3 mb-2 transition-colors">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
          className="min-h-11 flex-1 flex items-center gap-2 text-left"
        >
          <Music size={14} strokeWidth={2} className="text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 tracking-tight">
            {language === 'zh' ? '敬拜赞美歌单' : 'Worship Setlist'}
          </span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">
            {songs.length} {language === 'zh' ? '首' : 'songs'}
          </span>
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        <div className="flex items-center gap-2">
          {canEdit && !isAdding && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startAdding();
              }}
              className="min-h-11 px-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus size={12} strokeWidth={2.5} />
              <span>{language === 'zh' ? '加诗歌' : 'Add'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="pt-2 space-y-1">
          {/* Song List Items */}
          {songs.length === 0 && !(isAdding && canEdit) ? (
            <div className="py-2 text-center text-slate-400 dark:text-zinc-500 text-xs">
              <span>{language === 'zh' ? '尚未录入本周诗歌' : 'No songs added for this service'}</span>
              {canEdit && (
                <button
                  type="button"
                  onClick={startAdding}
                  className="block mx-auto mt-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + {language === 'zh' ? '点击添加第一首诗歌' : 'Add first song'}
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200/60 dark:divide-zinc-700/60">
              {songs.map((song, idx) => (
                <div
                  key={song.id}
                  className="py-2 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-100/50 dark:hover:bg-zinc-800/40 px-1 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 basis-40">
                    <span className="text-xs font-mono font-medium text-slate-400 dark:text-zinc-500 w-4 text-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 break-words w-full">
                        {song.title}
                      </span>

                      {song.key && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100/70 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                          Key {song.key}
                        </span>
                      )}

                      {song.category && (
                        <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                          {song.category}
                        </span>
                      )}

                      {song.notes && (
                        <span className="text-xs leading-relaxed whitespace-pre-wrap break-words text-slate-600 dark:text-zinc-400 w-full">
                          {song.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={
                        song.youtubeUrl ||
                        `https://www.youtube.com/results?search_query=${encodeURIComponent(song.title)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="在 YouTube 试听"
                      aria-label="在 YouTube 试听"
                      className="min-h-11 min-w-11 p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    >
                      <Play size={14} className="fill-current" />
                    </a>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSongId(song.id);
                          setTitle(song.title);
                          setKey(song.key || '');
                          setCategory(song.category || '快歌');
                          setYoutubeUrl(song.youtubeUrl || '');
                          setNotes(song.notes || '');
                          setIsAdding(true);
                        }}
                        aria-label={language === 'zh' ? `编辑诗歌 ${song.title}` : `Edit song ${song.title}`}
                        className="min-h-11 min-w-11 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center justify-center"
                      >
                        <Edit2 size={15} />
                      </button>
                    )}

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          removeSong(song.id, date, serviceId);
                          if (editingSongId === song.id) resetForm();
                        }}
                        title={language === 'zh' ? '删除诗歌' : 'Delete song'}
                        aria-label={language === 'zh' ? `删除诗歌 ${song.title}` : `Delete song ${song.title}`}
                        className="min-h-11 min-w-11 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Song Inline Form */}
          {isAdding && canEdit && (
            <form onSubmit={handleSaveSong} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-blue-200 dark:border-zinc-700 space-y-2.5 shadow-xs animate-slide-up mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  {editingSongId ? (language === 'zh' ? '编辑诗歌' : 'Edit Song') : (language === 'zh' ? '添加诗歌' : 'Add Song')}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  aria-label={language === 'zh' ? '取消编辑诗歌' : 'Cancel song editing'}
                  className="min-h-11 min-w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'zh' ? '诗歌名称' : 'Song Title'}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-900 dark:text-zinc-100"
                  aria-label={language === 'zh' ? '诗歌名称' : 'Song title'}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Key
                  <input
                    type="text"
                    aria-label="Key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder={language === 'zh' ? '领诗填写，例如 G、Bb、C-D' : 'Enter key, e.g. G, Bb, C-D'}
                    className="mt-1 w-full min-h-11 text-sm px-2.5 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 dark:text-zinc-100"
                  />
                </label>
              </div>

              {/* Category Selector Chips */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1">
                  {language === 'zh' ? '诗歌类型' : 'Category'}
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
                  <span>{language === 'zh' ? 'YouTube 链接，可留空' : 'YouTube Link (optional)'}</span>
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
                  placeholder={language === 'zh' ? '备注，可留空' : 'Optional notes'}
                  className="w-full text-xs px-2.5 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-zinc-300"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
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
