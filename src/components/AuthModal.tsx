import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  onClose: () => void;
  lang: Language;
  onAuthSuccess?: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  lang,
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const isAr = lang === 'ar';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      let user;
      if (mode === 'signup') {
        user = await registerWithEmail(email, password, name);
      } else {
        user = await loginWithEmail(email, password);
      }

      setIsSuccess(true);
      if (onAuthSuccess) onAuthSuccess(user);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      let message = err?.message || 'حدث خطأ أثناء المصادقة';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password';
      } else if (err.code === 'auth/email-already-in-use') {
        message = isAr ? 'هذا البريد الإلكتروني مسجل مسبقاً' : 'This email is already in use';
      } else if (err.code === 'auth/weak-password') {
        message = isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = isAr ? 'تم إغلاق نافذة تسجيل الدخول' : 'Sign-in popup was closed';
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      setIsSuccess(true);
      if (onAuthSuccess) onAuthSuccess(user);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      let message = isAr ? 'فشل تسجيل الدخول باستخدام Google' : 'Google sign-in failed';
      if (err.code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        message = isAr
          ? `النطاق الحالي (${host}) يحتاج إضافة في قائمة النطاقات المعتمدة (Authorized domains) في Firebase Console لمشروعك promet-b9327.`
          : `Current domain (${host}) must be added to Firebase Console -> Authorized domains for project promet-b9327.`;
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = isAr ? 'تم إلغاء نافذة تسجيل الدخول' : 'Popup closed by user';
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-3xl backdrop-blur-2xl bg-[#090A14]/95 border border-purple-500/30 shadow-[0_20px_70px_rgba(0,0,0,0.85)] p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {mode === 'login'
                ? (isAr ? 'تم تسجيل الدخول بنجاح! 🔥' : 'Welcome back! 🔥')
                : (isAr ? 'تم إنشاء الحساب في Firebase بنجاح! 🚀' : 'Account created successfully in Firebase! 🚀')}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr ? 'متصل بقاعدة بيانات سَوّيها السحابية...' : 'Connected to Sawihaa cloud database...'}
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 shadow-[0_0_25px_rgba(168,85,247,0.5)] mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white">
                {mode === 'login'
                  ? (isAr ? 'تسجيل الدخول إلى سَوّيها' : 'Sign in to Sawihaa')
                  : (isAr ? 'انضم إلى مجتمع سَوّيها' : 'Join Sawihaa Platform')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'المصادقة السحابية الآمنة المدعومة بـ Firebase'
                  : 'Secure cloud authentication powered by Firebase'}
              </p>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Segmented Mode Switcher */}
            <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'إنشاء حساب جديد' : 'Create Account'}
              </button>
            </div>

            {/* Google Social Login */}
            <div className="mb-6">
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-slate-200 transition-all cursor-pointer shadow-sm hover:border-purple-500/40"
              >
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
                <span>{isAr ? 'المتابعة باستخدام حساب Google' : 'Continue with Google'}</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#090A14] px-3 text-[11px] font-mono text-slate-400 shrink-0">
                {isAr ? 'أو بالبريد الإلكتروني' : 'or with email'}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {isAr ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isAr ? 'مثال: ليث محمد' : 'Laieth Mohammed'}
                      className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl violet-glow-btn text-xs font-semibold text-white tracking-wide shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>{mode === 'login' ? (isAr ? 'تسجيل الدخول' : 'Sign In') : (isAr ? 'إنشاء حساب فوري' : 'Create Free Account')}</span>
                    {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
