import React from 'react';
import { Play } from 'lucide-react';
import type { Language } from '../utils/i18n';

interface SongPreviewLinkProps {
  title: string;
  youtubeUrl?: string;
  language: Language;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const SongPreviewLink: React.FC<SongPreviewLinkProps> = ({ title, youtubeUrl, language, onClick }) => (
  <a
    href={youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    title={language === 'zh' ? '在 YouTube 试听' : 'Listen on YouTube'}
    aria-label={language === 'zh' ? `在 YouTube 试听：${title}` : `Listen on YouTube: ${title}`}
    className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-zinc-700 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
  >
    <Play size={18} strokeWidth={2.2} className="fill-current" aria-hidden="true" />
  </a>
);
