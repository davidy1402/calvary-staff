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
            <div className="py-4 text-center text-slate-400 dark:text-zinc-500 text-xs bg-white/60 dark:bg-zinc-900/40 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
              <p className="font-medium">{language === 'zh' ? '尚未录入本周诗歌' : 'No songs added for this service'}</p>
              {canEdit && (
                <button
                  type="button"
                  onClick={startAdding}
                  className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-zinc-700 transition-colors cursor-pointer"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>{language === 'zh' ? '录入第一首诗歌' : 'Add first song'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {songs.map((song, idx) => (
                <div
                  key={song.id}
                  className="p-3 bg-white dark:bg-zinc-900/90 rounded-xl border border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-2xs flex items-start justify-between gap-3"
                >
                  {/* Left: Number & Main info */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                      {idx + 1}
                    </span>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                          {song.title}
                        </span>

                        {song.key && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
                            Key: {song.key}
                          </span>
                        )}

                        {song.category && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                            song.category === '快歌'
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50'
                              : song.category === '回应'
                              ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/50'
                              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50'
                          }`}>
                            {song.category}
                          </span>
                        )}
                      </div>

                      {song.notes && (
                        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed break-words bg-slate-50 dark:bg-zinc-800/60 px-2 py-1 rounded-md">
                          {song.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 shrink-0 -mt-0.5">
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
                      className="w-8 h-8 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors cursor-pointer"
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
                        className="w-8 h-8 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Edit2 size={14} />
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
                        className="w-8 h-8 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add / Edit Song Clean Form Card */}
          {isAdding && canEdit && (
            <form onSubmit={handleSaveSong} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-blue-500/30 dark:border-blue-500/40 space-y-3.5 shadow-md animate-fade-in mt-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-zinc-100">
                  <Music size={16} className="text-blue-600 dark:text-blue-400" />
                  <span>{editingSongId ? (language === 'zh' ? '编辑诗歌' : 'Edit Song') : (language === 'zh' ? '添加诗歌' : 'Add Song')}</span>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  aria-label={language === 'zh' ? '取消' : 'Cancel'}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Title & Key */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {language === 'zh' ? '诗歌名称' : 'Title'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={language === 'zh' ? '例如：这一生最美的祝福' : 'e.g. 10,000 Reasons'}
                    className="w-full min-h-11 text-sm px-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 dark:text-zinc-100"
                    required
                    autoFocus
                  />
                </div>

                <div className="col-span-1 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Key
                  </label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="G / Bb / C"
                    className="w-full min-h-11 text-sm px-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Category Selector Chips */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {language === 'zh' ? '诗歌分类' : 'Category'}
                </label>
                <div className="flex items-center gap-2">
                  {categoryPresets.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`min-h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 flex items-center justify-center border ${
                        category === cat
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* YouTube Link */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Video size={13} className="text-red-500 shrink-0" />
                  <span>{language === 'zh' ? 'YouTube 试听链接 (可选)' : 'YouTube Link (optional)'}</span>
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtu.be/..."
                  className="w-full min-h-10 text-xs px-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-zinc-200 font-mono"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {language === 'zh' ? '段落编排 / 备注 (可选)' : 'Arrangement / Notes'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'zh' ? '例如：前奏4小节，副歌接回应祷告' : 'e.g. Intro 4 bars, bridge tag x2'}
                  className="w-full min-h-10 text-xs px-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-zinc-200"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="min-h-10 px-4 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  {language === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="min-h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Check size={14} strokeWidth={2.5} />
                  <span>{language === 'zh' ? '保存诗歌' : 'Save Song'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
