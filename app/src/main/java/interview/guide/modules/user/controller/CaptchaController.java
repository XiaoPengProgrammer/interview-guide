package interview.guide.modules.user.controller;

import interview.guide.common.result.Result;
import interview.guide.modules.user.service.CaptchaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 验证码控制器
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class CaptchaController {

    private final CaptchaService captchaService;

    /**
     * 获取图形验证码
     * <p>
     * 返回 captchaKey（UUID）和 captchaImage（base64 PNG），
     * 前端提交登录/注册时需同时携带这两个字段。
     */
    @GetMapping("/api/auth/captcha")
    public Result<Map<String, String>> getCaptcha() {
        Map<String, String> captcha = captchaService.generateCaptcha();
        return Result.success(captcha);
    }
}
