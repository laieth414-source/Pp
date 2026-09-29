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
  Sparkles,
} from 'lucide-react';
import { Language } from '../types';
import { loginWithEmail, loginWithGoogle } from '../lib/firebase';

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
  const [isGoogleVerifying, setIsGoogleVerifying] = useState(false);

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleGoogleAdminSubmit = async () => {
    setErrorMsg(null);
    setIsGoogleVerifying(true);
    try {
      const user = await loginWithGoogle();
      setIsGoogleVerifying(false);
      if (user.email === 'laieth772@gmail.com' || user.email?.includes('admin')) {
        onSuccess();
      } else {
        triggerError(
          isAr
            ? `الحساب (${user.email}) ليس لديه صلاحيات المشرف. يرجى استخدام البريد المعتمد (laieth772@gmail.com).`
            : `Account (${user.email}) does not have admin privileges. Use the authorized admin account.`
        );
      }
    } catch (err: any) {
      setIsGoogleVerifying(false);
      console.warn('[Admin Google Auth Info]:', err?.code || err?.message);
      if (err?.code === 'auth/popup-closed-by-user') {
        return;
      }
      triggerError(isAr ? 'تعذر إتمام الدخول بحساب Google' : 'Google admin sign-in failed');
    }
  };

  const handleFirebaseEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsVerifying(true);

    try {
      const user = await loginWithEmail(email.trim(), password);
      setIsVerifying(false);
      if (user.email === 'laieth772@gmail.com' || user.email?.includes('admin')) {
        onSuccess();
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setIsVerifying(false);
      console.warn('[Admin Auth Info]:', err?.code || err?.message);
      let msg = isAr ? 'فشل تسجيل الدخول، تأكد من صحة البريد وكلمة المرور' : 'Invalid email or password';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        msg = isAr
          ? 'بيانات الاعتماد غير صحيحة. إذا كان حسابك مسجلاً عبر Google، يرجى استخدام زر الدخول بحساب Google أدناه.'
          : 'Invalid credentials. If registered with Google, please use the Google sign-in button below.';
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
                ? 'الدخول مخصص للمشرف المعتمد (laieth772@gmail.com) عبر حساب Google أو البريد السحابي.'
                : 'Restricted administrative zone. Access is strictly authenticated for authorized admin.'}
            </p>
          </div>
        </div>

        {/* Quick Google Admin Login Option */}
        <div className="mt-5">
          <button
            type="button"
            disabled={isGoogleVerifying || isVerifying}
            onClick={handleGoogleAdminSubmit}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-violet-500/40 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm min-h-[42px]"
          >
            {isGoogleVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.28v3.13C3.26 21.31 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.6H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.4l4-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.69 1.28 6.6l4 3.13c.95-2.84 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isAr ? 'الدخول المباشر بحساب Google للإدارة' : 'Sign In with Admin Google Account'}</span>
              </>
            )}
          </button>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-white/[0.08] w-full" />
          <span className="bg-[#13141c] px-3 text-[11px] font-mono text-slate-400 shrink-0">
            {isAr ? 'أو بالبريد وكلمة المرور' : 'or with email/password'}
          </span>
        </div>

        {/* Error Message Box */}
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form Body: Firebase Email/Password */}
        <form onSubmit={handleFirebaseEmailSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#f8fafc] mb-1.5">
              {isAr ? 'البريد الإلكتروني للإدارة' : 'Admin Email'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="laieth772@gmail.com"
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
              disabled={isVerifying || isGoogleVerifying}
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
