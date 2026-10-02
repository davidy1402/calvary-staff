import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { generateWhatsAppRosterText } from '../utils/whatsappFormatter';
import { MessageSquare, Copy, Check, Send, Sparkles } from 'lucide-react';

export const WhatsAppTab: React.FC = () => {
  const { churchState, activeService, currentRoster } = useChurch();
  const [copied, setCopied] = useState(false);

  const formattedText = generateWhatsAppRosterText(
    churchState.churchName,
    activeService,
    currentRoster,
    churchState.roles,
    churchState.coworkers
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    formattedText
  )}`;

  return (
    <div className="space-y-4 pb-20">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MessageSquare size={20} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              WhatsApp 服事通知生成器
            </h2>
            <p className="text-xs text-slate-500">
              专为大马教会群组优化排版，一键复制或直接唤醒 WhatsApp
            </p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-xs ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {copied ? (
              <>
                <Check size={16} strokeWidth={2.5} />
                <span>已复制到剪贴板</span>
              </>
            ) : (
              <>
                <Copy size={16} strokeWidth={1.75} />
                <span>复制全部文字</span>
              </>
            )}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
          >
            <Send size={16} strokeWidth={1.75} />
            <span>打开 WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Message Live Preview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <Sparkles size={14} strokeWidth={1.75} className="text-amber-500" />
            <span>群发消息实时预览</span>
          </div>
          <span>自动随排班实时更新</span>
        </div>

        <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs leading-relaxed whitespace-pre-wrap rounded-b-2xl overflow-x-auto select-all">
          {formattedText}
        </div>
      </div>
    </div>
  );
};
