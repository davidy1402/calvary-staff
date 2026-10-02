import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { generateWhatsAppRosterText } from '../utils/whatsappFormatter';
import { X, Copy, Check, Send, MessageSquare } from 'lucide-react';
import type { ServiceDefinition, ServiceRoster } from '../types';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ServiceDefinition;
  initialRoster?: ServiceRoster;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  initialService,
  initialRoster,
}) => {
  const { churchState, activeService, currentRoster } = useChurch();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetService = initialService || activeService;
  const targetRoster = initialRoster || currentRoster;

  const formattedText = generateWhatsAppRosterText(
    churchState.churchName,
    targetService,
    targetRoster,
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

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-xl animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare size={18} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">WhatsApp 服事通知</h2>
              <p className="text-xs text-slate-500">
                {targetService.name} ({targetRoster?.date || '待定日期'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Text Preview */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap select-all">
            {formattedText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} strokeWidth={2.5} />
                <span>已复制全部</span>
              </>
            ) : (
              <>
                <Copy size={14} strokeWidth={1.75} />
                <span>复制全部文字</span>
              </>
            )}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
          >
            <Send size={14} strokeWidth={1.75} />
            <span>打开 WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
