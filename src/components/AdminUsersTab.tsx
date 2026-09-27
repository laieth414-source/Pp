import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  Calendar,
  Sparkles,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Language, AdminUser } from '../types';

interface AdminUsersTabProps {
  lang: Language;
  users: AdminUser[];
  onUpdateUsers: (users: AdminUser[]) => void;
  onTriggerToast: (msg: string) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  lang,
  users,
  onUpdateUsers,
  onTriggerToast,
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'creator' | 'member'>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState<Partial<AdminUser>>({
    name: '',
    username: '',
    email: '',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  });

  // Filter users based on search & role
  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        user.name.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Action Handlers
  const handleToggleRole = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        let nextRole: AdminUser['role'] = 'member';
        if (u.role === 'member') nextRole = 'creator';
        else if (u.role === 'creator') nextRole = 'admin';
        else nextRole = 'member';

        const roleNames = {
          admin: isAr ? 'مدير عام 👑' : 'Admin 👑',
          creator: isAr ? 'صانع محتوى 🎨' : 'Creator 🎨',
          member: isAr ? 'عضو 👤' : 'Member 👤',
        };

        onTriggerToast(
          isAr
            ? `تم تحديث صلاحية "${u.name}" إلى ${roleNames[nextRole]}`
            : `Updated "${u.name}" role to ${roleNames[nextRole]}`
        );
        return { ...u, role: nextRole };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleToggleStatus = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus: AdminUser['status'] = u.status === 'active' ? 'suspended' : 'active';
        onTriggerToast(
          nextStatus === 'suspended'
            ? (isAr ? `تم تعطيل حساب "${u.name}" مؤقتاً` : `Suspended account for "${u.name}"`)
            : (isAr ? `تم تنشيط وتفعيل حساب "${u.name}"` : `Activated account for "${u.name}"`)
        );
        return { ...u, status: nextStatus };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (window.confirm(isAr ? `هل أنت متأكد من حذف حساب "${target.name}" نهائياً؟` : `Permanently delete user "${target.name}"?`)) {
      const updated = users.filter((u) => u.id !== userId);
      onUpdateUsers(updated);
      onTriggerToast(isAr ? 'تم حذف المستخدم بنجاح' : 'User deleted');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name?.trim() || !newUser.email?.trim()) {
      onTriggerToast(isAr ? 'يرجى إكمال الاسم والبريد الإلكتروني' : 'Please provide name and email');
      return;
    }

    const created: AdminUser = {
      id: `u-${Date.now()}`,
      name: newUser.name.trim(),
      username: newUser.username?.trim().startsWith('@') ? newUser.username.trim() : `@${newUser.username || 'user'}`,
      email: newUser.email.trim(),
      avatar: newUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: newUser.role || 'member',
      status: 'active',
      promptsCount: 0,
      joinedDate: isAr ? 'اليوم' : 'Today',
    };

    onUpdateUsers([created, ...users]);
    setIsAddUserOpen(false);
    setNewUser({
      name: '',
      username: '',
      email: '',
      role: 'member',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    });
    onTriggerToast(isAr ? 'تم إنشاء الحساب بنجاح! ✓' : 'User created! ✓');
  };

  const getRoleBadge = (role: AdminUser['role']) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            <span>{isAr ? 'مدير' : 'Admin'}</span>
          </span>
        );
      case 'creator':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{isAr ? 'صانع محتوى' : 'Creator'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.04] text-slate-300 border border-white/10">
            <span>{isAr ? 'عضو' : 'Member'}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Header and Add User Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>{isAr ? 'إدارة المستخدمين المسجلين' : 'Users Management'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'إدارة صلاحيات الأعضاء، ترقية لصانع محتوى أو مدير، وتعطيل أو حذف الحسابات.'
              : 'Manage member roles, permissions, suspensions, and account moderation.'}
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="violet-glow-btn px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة مستخدم جديد' : 'Add New User'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isAr ? 'ابحث بالاسم، المعرف، أو البريد...' : 'Search by name, handle, email...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-9 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-purple-600/30 border border-purple-500 text-purple-200'
                : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'admin'
                ? 'bg-purple-600/30 border border-purple-500 text-purple-200'
                : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'المدراء' : 'Admins'}
          </button>
          <button
            onClick={() => setRoleFilter('creator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'creator'
                ? 'bg-purple-600/30 border border-purple-500 text-purple-200'
                : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'صناع المحتوى' : 'Creators'}
          </button>
          <button
            onClick={() => setRoleFilter('member')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'member'
                ? 'bg-purple-600/30 border border-purple-500 text-purple-200'
                : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'الأعضاء' : 'Members'}
          </button>
        </div>
      </div>

      {/* Quick Add User Drawer/Form */}
      {isAddUserOpen && (
        <form
          onSubmit={handleCreateUser}
          className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'تسجيل مستخدم جديد في النظام' : 'Register New User'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">
                {isAr ? 'الاسم الكامل' : 'Full Name'} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="مثال: يوسف الخالد"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">
                {isAr ? 'اسم المستخدم (Handle)' : 'Username'}
              </label>
              <input
                type="text"
                placeholder="@username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">
                {isAr ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                placeholder="user@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">
                {isAr ? 'الدور والصلاحية' : 'Role'}
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-[#0F1020] border border-white/10 text-xs text-white"
              >
                <option value="member">{isAr ? 'عضو عادي' : 'Member'}</option>
                <option value="creator">{isAr ? 'صانع محتوى معتمد' : 'Verified Creator'}</option>
                <option value="admin">{isAr ? 'مدير نظام' : 'Administrator'}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/[0.04]"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="violet-glow-btn px-5 py-2 rounded-xl text-xs font-semibold text-white"
            >
              {isAr ? 'تسجيل المستخدم' : 'Save User'}
            </button>
          </div>
        </form>
      )}

      {/* Mobile Stacked Mini-Cards (sm:hidden) */}
      <div className="sm:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs bg-white/[0.02] rounded-2xl border border-white/10">
            {isAr ? 'لا يوجد مستخدمون مطابقون لمعايير البحث' : 'No users matching search'}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex flex-col gap-3.5 p-4 bg-[#11121c] border border-white/10 rounded-2xl shadow-lg hover:border-purple-500/30 transition-all"
            >
              {/* Top Row: User Avatar, Name, Role Badge, Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-purple-500/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{user.name}</h4>
                    <span className="text-[11px] font-mono text-purple-300 truncate block">{user.username}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  {getRoleBadge(user.role)}
                  {user.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{isAr ? 'نشط' : 'Active'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>{isAr ? 'معطل' : 'Suspended'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Row: Email & Joined Date & Prompts Count */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06] flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px] truncate max-w-[200px]">
                  <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span>📅 {user.joinedDate}</span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    {user.promptsCount} {isAr ? 'برومبت' : 'prompts'}
                  </span>
                </div>
              </div>

              {/* Touch-Friendly Action Buttons Stack (min-h-[42px]) */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => handleToggleRole(user.id)}
                  className="min-h-[42px] px-2.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{isAr ? 'ترقية' : 'Role'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(user.id)}
                  className={`min-h-[42px] px-2.5 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                    user.status === 'active'
                      ? 'bg-amber-950/30 hover:bg-amber-900/50 border-amber-500/30 text-amber-200'
                      : 'bg-emerald-950/30 hover:bg-emerald-900/50 border-emerald-500/30 text-emerald-200'
                  }`}
                >
                  {user.status === 'active' ? (
                    <>
                      <UserX className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{isAr ? 'تعطيل' : 'Suspend'}</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{isAr ? 'تفعيل' : 'Activate'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteUser(user.id)}
                  className="min-h-[42px] px-2.5 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{isAr ? 'حذف' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Users Data Table */}
      <div className="hidden sm:block rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 font-semibold">
                <th className="py-3.5 px-4">{isAr ? 'المستخدم' : 'User'}</th>
                <th className="py-3.5 px-4">{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                <th className="py-3.5 px-4">{isAr ? 'تاريخ الانضمام' : 'Joined'}</th>
                <th className="py-3.5 px-4 text-center">{isAr ? 'البرومبتات' : 'Prompts'}</th>
                <th className="py-3.5 px-4">{isAr ? 'الصلاحية' : 'Role'}</th>
                <th className="py-3.5 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="py-3.5 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {isAr ? 'لا يوجد مستخدمون مطابقون لمعايير البحث' : 'No users matching search'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* User Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-purple-500/30"
                        />
                        <div>
                          <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                            {user.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {user.email}
                    </td>

                    {/* Joined Date */}
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {user.joinedDate}
                    </td>

                    {/* Prompts Count */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-purple-300">
                      {user.promptsCount}
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {user.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{isAr ? 'نشط' : 'Active'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <span>{isAr ? 'معطل' : 'Suspended'}</span>
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Change Role Button */}
                        <button
                          onClick={() => handleToggleRole(user.id)}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-purple-600/30 text-slate-300 hover:text-purple-200 transition-colors cursor-pointer"
                          title={isAr ? 'تغيير / ترقية الصلاحية' : 'Cycle Role'}
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>

                        {/* Suspend / Activate Button */}
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            user.status === 'active'
                              ? 'bg-white/[0.04] hover:bg-amber-500/20 text-slate-300 hover:text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                          title={user.status === 'active' ? (isAr ? 'تعطيل مؤقت' : 'Suspend') : (isAr ? 'إعادة التنشيط' : 'Activate')}
                        >
                          {user.status === 'active' ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Delete User Button */}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
                          title={isAr ? 'حذف الحساب' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
