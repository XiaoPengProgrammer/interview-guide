import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi, tokenManager } from '../api/auth';
import { UserPlus, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', displayName: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError(t('auth.password_mismatch'));
      return;
    }
    if (form.password.length < 6) {
      setError(t('auth.password_too_short'));
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        username: form.username,
        password: form.password,
        displayName: form.displayName || undefined,
      });
      tokenManager.setToken(res.token);
      tokenManager.setUser(res);
      navigate('/history');
    } catch (err: any) {
      setError(err.message || t('auth.register_failed'));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">AI Interview</h1>
              <p className="text-sm text-slate-400">{t('auth.register_subtitle')}</p>
            </div>
          </div>
        </div>

        {/* 注册表单 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.username_required')}</label>
              <input
                type="text"
                value={form.username}
                onChange={e => updateField('username', e.target.value)}
                placeholder={t('auth.username_placeholder')}
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/*<div>*/}
            {/*  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">显示名称</label>*/}
            {/*  <input*/}
            {/*    type="text"*/}
            {/*    value={form.displayName}*/}
            {/*    onChange={e => updateField('displayName', e.target.value)}*/}
            {/*    placeholder="可选，默认使用用户名"*/}
            {/*    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"*/}
            {/*  />*/}
            {/*</div>*/}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.password_required')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => updateField('password', e.target.value)}
                  placeholder={t('auth.password_placeholder_min')}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.confirm_password')}</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => updateField('confirmPassword', e.target.value)}
                placeholder={t('auth.confirm_password_placeholder')}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {error && (
              <div className="px-4 py-2.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? t('auth.register_loading') : t('auth.register')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-slate-400">{t('auth.has_account')}</span>
            <Link to="/login" className="ml-1 text-sm text-primary-600 hover:text-primary-500 font-medium">
              {t('auth.login')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
