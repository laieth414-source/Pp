import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Language } from '../types';
import { loginWithEmail } from '../lib/firebase';

interface AdminAuthGateModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthGateModal: React.FC<AdminAuthGateModalProps> = ({
  isOpen,
  lang,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleFirebaseEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsVerifying(true);

    try {
      await loginWithEmail(email.trim(), password);
      setIsVerifying(false);
      onSuccess();
    } catch (err: any) {
      setIsVerifying(false);
      console.error('Admin Auth Error:', err);
      let msg = isAr ? 'فشل تسجيل الدخول، تأكد من صحة البريد وكلمة المرور' : 'Invalid email or password';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        msg = isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid credentials';
      } else if (err.code === 'auth/too-many-requests') {
        msg = isAr ? 'محاولات دخول كثيرة، يرجى الانتظار دقيقة' : 'Too many attempts, please wait';
      }
      triggerError(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-[92%] max-w-lg mx-auto rounded-2xl p-5 sm:p-8 bg-[#13141c] border ${
          errorMsg
            ? 'border-rose-500/70 shadow-lg'
            : 'border-white/10 shadow-xl'
        } transition-all duration-200 ${shake ? 'animate-bounce' : ''}`}
      >
        {/* Shield Icon Lock Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-violet-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#13141c]" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#f8fafc] tracking-tight flex items-center justify-center gap-2">
              <span>{isAr ? 'بوابة إدارة المنصة' : 'Admin Security Portal'}</span>
            </h2>
            <p className="text-xs text-[#94a3b8] mt-1 max-w-sm mx-auto leading-relaxed">
              {isAr
                ? 'الدخول مخصص للمشرفين فقط عبر البريد الإلكتروني وكلمة المرور المعتمدة.'
                : 'Restricted administrative zone. Access is strictly authenticated via Firebase credentials.'}
            </p>
          </div>
        </div>

        {/* Error Message Box */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body: Firebase Email/Password ONLY */}
        <form onSubmit={handleFirebaseEmailSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#f8fafc] mb-1.5">
              {isAr ? 'البريد الإلكتروني للإدارة' : 'Admin Email'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="admin@sawihaa.ai"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[#f8fafc] text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#f8fafc] mb-1.5">
              {isAr ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[#f8fafc] text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#94a3b8] hover:text-[#f8fafc] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer min-h-[42px]"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 border border-violet-500/40 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 transition-colors min-h-[42px]"
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
                  {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
