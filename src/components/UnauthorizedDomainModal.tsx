import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { Language } from '../types';

interface UnauthorizedDomainModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onContinueDemo?: () => void;
}

export const UnauthorizedDomainModal: React.FC<UnauthorizedDomainModalProps> = ({
  isOpen,
  lang,
  onClose,
  onContinueDemo,
}) => {
  const [copiedDomain, setCopiedDomain] = useState(false);
  const isAr = lang === 'ar';

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseSettingsUrl = 'https://console.firebase.google.com/project/promet-b9327/authentication/settings';

  const handleCopyHostname = () => {
    if (navigator?.clipboard && currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[92%] max-w-lg mx-auto rounded-3xl p-4 sm:p-8 bg-gradient-to-br from-[#151226] via-[#0E0F1A] to-[#080910] border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-white"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rtl:right-auto rtl:left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>{isAr ? 'تنبيه النطاق المعتمد في Firebase' : 'Authorized Domain Required'}</span>
            </h3>
            <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
              {isAr
                ? 'تتطلب مصادقة Google إضافة رابط الموقع (Domain) الحالي إلى قائمة النطاقات المعتمدة في مشروع Firebase الخاص بك.'
                : 'Google Sign-In requires this application domain to be allowlisted in your Firebase project console.'}
            </p>
          </div>
        </div>

        {/* Current Domain Box with 1-click Copy */}
        <div className="mb-5 p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span>{isAr ? 'النطاق الحالي المراد إضافته:' : 'Current Domain to Authorize:'}</span>
            <span className="text-[10px] text-amber-400 font-mono">auth/unauthorized-domain</span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-purple-300 break-all select-all">
            <span className="truncate">{currentHostname || 'localhost'}</span>
            <button
              type="button"
              onClick={handleCopyHostname}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-sans transition-all cursor-pointer"
            >
              {copiedDomain ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isAr ? 'نسخ' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step by Step Guide */}
        <div className="space-y-2 text-xs text-slate-300 mb-6 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.06]">
          <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? 'خطوات الحل السريعة (خلال 30 ثانية):' : 'Quick 30-Second Solution:'}</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed pr-1 rtl:pr-1 rtl:pl-0 pl-1">
            <li>
              <span>{isAr ? 'افتح إعدادات مشروعك: ' : 'Open project settings: '}</span>
              <a
                href={firebaseSettingsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1 font-mono"
              >
                <span>Firebase Authentication Settings</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              {isAr
                ? 'انتقل إلى تبويب "Authorized domains" واضغط على "Add domain".'
                : 'Navigate to "Authorized domains" tab and click "Add domain".'}
            </li>
            <li>
              {isAr
                ? 'الصق النطاق المنسوخ أعلاه واضغط حفظ، وستعمل المصادقة تلقائياً فوراً!'
                : 'Paste the domain copied above, click Save, and Google Sign-In will work immediately.'}
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {onContinueDemo && (
            <button
              type="button"
              onClick={() => {
                onContinueDemo();
                onClose();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl violet-glow-btn text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(168,85,247,0.4)]"
            >
              <UserCheck className="w-4 h-4 text-purple-200" />
              <span>{isAr ? 'الدخول كحساب تجريبي فوري' : 'Instant Demo Login'}</span>
            </button>
          )}

          <a
            href={firebaseSettingsUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{isAr ? 'فتح Firebase Console' : 'Open Firebase Console'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
