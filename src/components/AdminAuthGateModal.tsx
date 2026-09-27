import React, { useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Mail,
  Loader2,
  Sparkles,
  ShieldCheck,
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
  const [authMethod, setAuthMethod] = useState<'firebase' | 'passcode'>('firebase');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const MASTER_PIN = 'sawwiha2026';

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
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid credentials';
      } else if (err.code === 'auth/too-many-requests') {
        msg = isAr ? 'محاولات دخول كثيرة، يرجى الانتظار دقيقة' : 'Too many attempts, please wait';
      }
      triggerError(msg);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      if (pin === MASTER_PIN) {
        onSuccess();
      } else {
        triggerError(isAr ? 'رمز الدخول غير صحيح! الرمز الافتراضي هو: sawwiha2026' : 'Invalid passcode! Default is: sawwiha2026');
      }
    }, 300);
  };

  const handleGoogleAdminLogin = async () => {
    setErrorMsg(null);
    setIsVerifying(true);
    try {
      await loginWithGoogle();
      setIsVerifying(false);
      onSuccess();
    } catch (err: any) {
      setIsVerifying(false);
      if (err.code === 'auth/unauthorized-domain') {
        triggerError(
          isAr
            ? 'النطاق الحالي يحتاج إضافة في Firebase Console. يمكنك الدخول فوراً برمز المرور (sawwiha2026).'
            : 'Domain needs authorization in Firebase Console. You can enter instantly using master pin (sawwiha2026).'
        );
      } else if (err.code !== 'auth/popup-closed-by-user') {
        triggerError(isAr ? 'فشل تسجيل الدخول بحساب Google' : 'Google sign in failed');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-[92%] max-w-lg mx-auto rounded-3xl p-4 sm:p-8 bg-gradient-to-br from-[#121024] via-[#0B0C16] to-[#07080E] border ${
          errorMsg
            ? 'border-rose-500/70 shadow-[0_0_40px_rgba(244,63,94,0.35)]'
            : 'border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.3)]'
        } backdrop-blur-3xl transition-all duration-300 ${shake ? 'animate-bounce' : ''}`}
      >
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-24 bg-purple-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Shield Icon Lock Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.5)] border border-purple-400/40">
            <Lock className="w-7 h-7 text-white" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0B0C16] animate-pulse" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>{isAr ? 'منطقة الإدارة المحمية' : 'Protected Admin Zone'}</span>
              <span>🔒</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              {isAr
                ? 'سجل دخولك كمدير بواسطة Firebase Auth أو استخدم رمز المرور السريع.'
                : 'Authenticate via Firebase Auth or use the direct administrative master pin.'}
            </p>
          </div>
        </div>

        {/* Auth Method Switcher */}
        <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] mt-6 mb-4">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('firebase');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === 'firebase'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{isAr ? 'بريد وكلمة مرور' : 'Firebase Login'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('passcode');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === 'passcode'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isAr ? 'رمز المرور المباشر' : 'Master PIN'}</span>
          </button>
        </div>

        {/* Error Message Box */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body: Firebase Email/Password */}
        {authMethod === 'firebase' ? (
          <form onSubmit={handleFirebaseEmailSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? 'البريد الإلكتروني للمدير' : 'Admin Email'}
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
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Google Admin Login Option */}
            <div className="pt-1">
              <button
                type="button"
                disabled={isVerifying}
                onClick={handleGoogleAdminLogin}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-[11px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                <span>{isAr ? 'أو الدخول بحساب Google المعتمد' : 'Or continue with Google Admin'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isVerifying}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white violet-glow-btn flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50"
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
                    {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Form Body: Master Passcode */
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
                <label className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isAr ? 'رمز المرور الرئيسي' : 'Master Passcode'}</span>
                </label>
                <span className="text-[10px] text-purple-300/80 font-mono">
                  sawwiha2026
                </span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setPin('sawwiha2026');
                  setErrorMsg(null);
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                {isAr ? 'تعبئة الرمز الافتراضي (sawwiha2026)' : 'Autofill default pin'}
              </button>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isVerifying}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white violet-glow-btn flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50"
              >
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>{isAr ? 'دخول لوحة الإدارة' : 'Unlock Dashboard'}</span>
                    {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
