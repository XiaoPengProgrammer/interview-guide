import {Link, Outlet, useLocation, useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {Calendar, ChevronRight, Database, FileStack, LogOut, MessageSquare, Moon, Settings, Sparkles, Sun, User, Users,} from 'lucide-react';
import {useTheme} from '../hooks/useTheme';
import {useTranslation} from 'react-i18next';
import {useState} from 'react';
import UnifiedInterviewModal, {UnifiedInterviewConfig} from './UnifiedInterviewModal';
import LanguageSwitcher from './LanguageSwitcher';
import {tokenManager} from '../api/auth';

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export default function Layout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const {theme, toggleTheme} = useTheme();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [interviewModalPreset, setInterviewModalPreset] = useState<{
    defaultMode: 'text' | 'voice';
    defaultResumeId?: number;
    title: string;
    subtitle: string;
    startButtonText: string;
  } | null>(null);

  const openInterviewModalWithResume = (resumeId: number) => {
    setInterviewModalPreset({
      defaultMode: 'text',
      defaultResumeId: resumeId,
      title: t('interview.start_interview_title'),
      subtitle: t('interview.start_interview_subtitle'),
      startButtonText: t('interview.start_interview'),
    });
  };

  const handleInterviewStart = (config: UnifiedInterviewConfig) => {
    setInterviewModalPreset(null);
    if (config.mode === 'text') {
      navigate('/interview', {
        state: {
          resumeId: config.resumeId,
          interviewConfig: {
            skillId: config.skillId,
            difficulty: config.difficulty,
            questionCount: config.questionCount,
            llmProvider: config.llmProvider,
          },
        },
      });
      return;
    }

    const params = new URLSearchParams({
      skillId: config.skillId,
      difficulty: config.difficulty,
    });
    navigate(`/voice-interview?${params.toString()}`, {
      state: {
        voiceConfig: {
          skillId: config.skillId,
          difficulty: config.difficulty,
          techEnabled: true,
          projectEnabled: true,
          hrEnabled: true,
          plannedDuration: config.plannedDuration,
          resumeId: config.resumeId,
          llmProvider: config.llmProvider,
        },
      },
    });
  };

  // 按业务模块组织的导航项
  const navGroups: NavGroup[] = [
    {
      id: 'interview',
      title: t('nav.group_interview'),
      items: [
        { id: 'resumes', path: '/history', label: t('nav.resumes'), icon: FileStack, description: t('nav.resumes_desc') },
        { id: 'interview-hub', path: '/interview-hub', label: t('nav.interview_hub'), icon: Sparkles, description: t('nav.interview_hub_desc') },
        { id: 'interviews', path: '/interviews', label: t('nav.interviews'), icon: Users, description: t('nav.interviews_desc') },
        { id: 'interview-schedule', path: '/interview-schedule', label: t('nav.interview_schedule'), icon: Calendar, description: t('nav.interview_schedule_desc') },
      ],
    },
    {
      id: 'knowledge',
      title: t('nav.group_knowledge'),
      items: [
        { id: 'kb-manage', path: '/knowledgebase', label: t('nav.kb_manage'), icon: Database, description: t('nav.kb_manage_desc') },
        { id: 'chat', path: '/knowledgebase/chat', label: t('nav.chat'), icon: MessageSquare, description: t('nav.chat_desc') },
      ],
    },
    {
      id: 'system',
      title: t('nav.group_system'),
      items: [
        { id: 'settings', path: '/settings', label: t('nav.settings'), icon: Settings, description: t('nav.settings_desc') },
      ],
    },
  ];

  // 判断当前页面是否匹配导航项
  const isActive = (path: string) => {
    if (path.startsWith('#')) return false;
    if (path === '/history') {
      return currentPath === '/history'
        || currentPath === '/'
        || currentPath.startsWith('/history/')
        || currentPath === '/upload';
    }
    if (path === '/interview-hub') {
      return currentPath === '/interview-hub'
        || currentPath === '/interview'
        || currentPath.startsWith('/interview/')
        || currentPath.startsWith('/voice-interview');
    }
    if (path === '/knowledgebase') {
      return currentPath === '/knowledgebase' || currentPath === '/knowledgebase/upload';
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 dark:from-slate-900 dark:to-slate-800">
      {/* 左侧边栏 */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-700 fixed h-screen left-0 top-0 z-50 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <Link to="/history" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-800 dark:text-white tracking-tight block">AI Interview</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{t('nav.brand_subtitle')}</span>
            </div>
          </Link>
        </div>

        {/* 主题切换按钮 */}
        <div className="px-4 pb-2 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4" />
                <span className="text-sm font-medium">{t('nav.light_mode')}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span className="text-sm font-medium">{t('nav.dark_mode')}</span>
              </>
            )}
          </button>
          <LanguageSwitcher />
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.id}>
                <div className="px-3 mb-2">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {group.title}
                  </span>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.path);

                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                          ${active
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                          ${active
                            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-700 dark:group-hover:text-white'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm block ${active ? 'font-semibold' : 'font-medium'}`}>
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 truncate block">
                              {item.description}
                            </span>
                          )}
                        </div>
                        {active && <ChevronRight className="w-4 h-4 text-primary-400" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* 底部信息 */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
          {/* 用户信息 */}
          <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/30 dark:to-slate-800 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-primary-600 dark:text-primary-400 font-medium truncate">
                {tokenManager.getUser()?.displayName || tokenManager.getUser()?.username}
              </span>
            </div>
            <button
              onClick={() => { tokenManager.logout(); window.location.reload(); }}
              className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
              title={t('nav.logout_title')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/30 dark:to-slate-800 rounded-xl">
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{t('nav.version')}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('nav.powered_by')}</p>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 ml-64 p-10 min-h-screen overflow-y-auto">
        <motion.div
          key={currentPath}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet context={{ openInterviewModalWithResume }} />
        </motion.div>
      </main>

      {/* 统一面试弹窗 */}
      <UnifiedInterviewModal
        isOpen={interviewModalPreset !== null}
        onClose={() => setInterviewModalPreset(null)}
        onStart={handleInterviewStart}
        defaultMode={interviewModalPreset?.defaultMode || 'text'}
        defaultResumeId={interviewModalPreset?.defaultResumeId}
        hideModeSwitch={interviewModalPreset?.defaultResumeId == null}
        title={interviewModalPreset?.title || t('interview.start_interview_title')}
        subtitle={interviewModalPreset?.subtitle || t('interview.start_interview_subtitle')}
        startButtonText={interviewModalPreset?.startButtonText || t('interview.start_interview')}
      />
    </div>
  );
}
