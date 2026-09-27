import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  onClose: () => void;
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  lang,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const isAr = lang === 'ar';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
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
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {mode === 'login'
                ? (isAr ? 'تم تسجيل الدخول بنجاح!' : 'Welcome back!')
                : (isAr ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!')}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr ? 'جاري تحويلك إلى لوحة التحكم...' : 'Redirecting to your workspace...'}
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
                  ? 'الوصول إلى آلاف البرومبتات الحصرية وحفظ مفضلاتك'
                  : 'Access exclusive verified prompts and organize your library'}
              </p>
            </div>

            {/* Segmented Mode Switcher */}
            <div className="flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
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
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'إنشاء حساب جديد' : 'Create Account'}
              </button>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  setEmail('user@gmail.com');
                  handleSubmit({ preventDefault: () => {} } as any);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-200 transition-all cursor-pointer"
              >
                <span className="font-bold text-sm">G</span>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('user@discord.com');
                  handleSubmit({ preventDefault: () => {} } as any);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-200 transition-all cursor-pointer"
              >
                <span className="text-purple-400 font-bold text-sm">✦</span>
                <span>Discord</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#090A14] px-3 text-[11px] font-mono text-slate-400 shrink-0">
                {isAr ? 'أو عبر البريد الإلكتروني' : 'or with email'}
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
                      placeholder={isAr ? 'مثال: أحمد العراقي' : 'John Doe'}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl violet-glow-btn text-xs font-semibold text-white tracking-wide shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                <span>{mode === 'login' ? (isAr ? 'تسجيل الدخول' : 'Sign In') : (isAr ? 'إنشاء حساب فوري' : 'Create Free Account')}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
