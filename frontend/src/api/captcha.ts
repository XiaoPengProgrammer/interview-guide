import { request } from './request';

export interface CaptchaResponse {
  captchaKey: string;
  captchaImage: string; // base64 图片 data URL
}

export const captchaApi = {
  /** 获取验证码 */
  getCaptcha: () =>
    request.get<CaptchaResponse>('/api/auth/captcha'),
};
