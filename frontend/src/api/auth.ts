// 前端认证 API
import { request } from './request';

export interface LoginRequest {
  username: string;
  password: string;
  captchaKey: string;
  captchaCode: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  displayName?: string;
  email?: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  tokenType: string;
  username: string;
  displayName: string;
  userId: number;
}

export const authApi = {
  /** 登录 */
  login: (data: LoginRequest) =>
    request.post<AuthResponse>('/api/auth/login', data),

  /** 注册 */
  register: (data: RegisterRequest) =>
    request.post<AuthResponse>('/api/auth/register', data),
};

/** Token 管理（localStorage） */
export const tokenManager = {
  getToken: (): string | null => localStorage.getItem('auth_token'),
  setToken: (token: string) => localStorage.setItem('auth_token', token),
  removeToken: () => localStorage.removeItem('auth_token'),
  getUser: () => {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) as AuthResponse : null;
  },
  setUser: (user: AuthResponse) => localStorage.setItem('auth_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('auth_user'),
  isLoggedIn: () => !!localStorage.getItem('auth_token'),
  /** 退出登录 */
  logout: () => {
    tokenManager.removeToken();
    tokenManager.removeUser();
  },
};
