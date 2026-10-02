import React, { useRef, useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Info,
  Globe,
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { churchState, exportBackup, importBackup, resetToDefault } = useChurch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importBackup(text);
      if (success) {
        setImportStatus('备份数据恢复成功！');
      } else {
        alert('备份文件格式不正确，导入失败。');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Settings Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Settings size={20} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              系统设置与数据安全
            </h2>
            <p className="text-xs text-slate-500">
              数据保存于本地浏览器，支持随时导出 JSON 备份给干事与同工
            </p>
          </div>
        </div>
      </div>

      {/* Backup & Restore Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Download size={16} strokeWidth={1.75} className="text-blue-600" />
          <span>数据备份与还原</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          排班数据均保存在此设备中。为防浏览器缓存被清理，建议每月导出一次 JSON
          备份，存入教会共用 Google Drive。
        </p>

        {importStatus && (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200">
            <CheckCircle2 size={16} strokeWidth={2} />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={exportBackup}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download size={15} strokeWidth={2} />
            <span>导出备份文件 (.json)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Upload size={15} strokeWidth={2} />
            <span>导入并恢复备份</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={resetToDefault}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 py-1"
          >
            <RotateCcw size={13} strokeWidth={2} />
            <span>重置为加略山初始演示数据</span>
          </button>
        </div>
      </div>

      {/* Church Profile Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Globe size={16} strokeWidth={1.75} className="text-slate-700" />
          <span>母会基础配置信息</span>
        </h3>

        <div className="text-xs space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
          <div className="flex justify-between">
            <span className="text-slate-500">教会全称：</span>
            <span className="font-semibold text-slate-800">{churchState.churchName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">时区设置：</span>
            <span className="font-semibold text-slate-800">Asia/Kuala_Lumpur (UTC+8)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">聚会堂会数量：</span>
            <span className="font-semibold text-slate-800">
              {churchState.services.length} 个（华语堂/英语堂/青年/祷告会）
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">已登记同工总数：</span>
            <span className="font-semibold text-slate-800">
              {churchState.coworkers.length} 位
            </span>
          </div>
        </div>
      </div>

      {/* Zero Cost Hosting Tip */}
      <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 text-xs text-blue-900 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-blue-950">
          <Info size={15} strokeWidth={2} className="text-blue-600 shrink-0" />
          <span>永久 RM 0 部署提示</span>
        </div>
        <p className="leading-relaxed text-blue-800/90">
          本工程编译产物（dist 目录）可直接托管至 Cloudflare Pages 或
          Vercel，享有无限免费流量与高速 Anycast CDN 节点，无需租用 VPS 服务器，终生零月费。
        </p>
      </div>
    </div>
  );
};
