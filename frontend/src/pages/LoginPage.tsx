import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi, tokenManager } from '../api/auth';
import { captchaApi } from '../api/captcha';
import { LogIn, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 验证码
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);

  /** 获取验证码 */
  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const res = await captchaApi.getCaptcha();
      setCaptchaKey(res.captchaKey);
      setCaptchaImage(res.captchaImage);
      setCaptchaCode('');
    } catch {
      // 静默失败，不影响登录
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({
        username,
        password,
        captchaKey,
        captchaCode,
      });
      tokenManager.setToken(res.token);
      tokenManager.setUser(res);
      navigate('/history');
    } catch (err: any) {
      setError(err.message || t('auth.login_failed'));
      // 失败后刷新验证码
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
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
              <p className="text-sm text-slate-400">{t('auth.login_subtitle')}</p>
            </div>
          </div>
        </div>

        {/* 登录表单 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.username')}</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={t('auth.username_placeholder')}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  required
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

            {/* 验证码 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.captcha')}</label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={captchaCode}
                  onChange={e => setCaptchaCode(e.target.value)}
                  placeholder={t('auth.captcha_placeholder')}
                  required
                  maxLength={4}
                  className="w-32 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                />
                <div className="flex items-center gap-2">
                  {captchaImage ? (
                    <img
                      src={captchaImage}
                      alt="captcha"
                      className="h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-600 hover:opacity-80 transition-opacity"
                      onClick={fetchCaptcha}
                      title={t('auth.captcha_refresh')}
                    />
                  ) : (
                    <div className="h-10 w-28 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                      {captchaLoading ? t('auth.captcha_loading') : t('auth.captcha_empty')}
                    </div>
                  )}
                </div>
              </div>
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
              <LogIn className="w-4 h-4" />
              {loading ? t('auth.login_loading') : t('auth.login')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-slate-400">{t('auth.no_account')}</span>
            <Link to="/register" className="ml-1 text-sm text-primary-600 hover:text-primary-500 font-medium">
              {t('auth.register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
