package interview.guide.modules.user.service;

import interview.guide.common.auth.JwtUtil;
import interview.guide.common.exception.BusinessException;
import interview.guide.common.exception.ErrorCode;
import interview.guide.modules.user.entity.UserEntity;
import interview.guide.modules.user.model.AuthResponse;
import interview.guide.modules.user.model.LoginRequest;
import interview.guide.modules.user.model.RegisterRequest;
import interview.guide.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 用户认证服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;
  private final JwtUtil jwtUtil;
  private final CaptchaService captchaService;

  private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  /**
   * 用户注册
   */
  @Transactional
  public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByUsername(request.username())) {
      throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS, "用户名已被注册");
    }

    UserEntity user = UserEntity.builder()
        .username(request.username())
        .password(passwordEncoder.encode(request.password()))
        .displayName(request.displayName() != null ? request.displayName() : request.username())
        .email(request.email())
        .build();

    user = userRepository.save(user);
    log.info("用户注册成功: userId={}, username={}", user.getId(), user.getUsername());

    String token = jwtUtil.generateToken(user.getUsername());
    LocalDateTime expiresAt = LocalDateTime.now()
        .plusSeconds(jwtUtil.getExpiration() / 1000);

    return AuthResponse.of(token, expiresAt, user.getUsername(),
        user.getDisplayName(), user.getId());
  }

  /**
   * 用户登录
   */
  public AuthResponse login(LoginRequest request) {
    // 校验验证码
    validateCaptcha(request.captchaKey(), request.captchaCode());

    UserEntity user = userRepository.findByUsername(request.username())
        .orElseThrow(() -> new BusinessException(ErrorCode.USER_PASSWORD_ERROR, "用户名或密码错误"));

    if (!passwordEncoder.matches(request.password(), user.getPassword())) {
      throw new BusinessException(ErrorCode.USER_PASSWORD_ERROR, "用户名或密码错误");
    }

    log.info("用户登录成功: userId={}, username={}", user.getId(), user.getUsername());

    String token = jwtUtil.generateToken(user.getUsername());
    LocalDateTime expiresAt = LocalDateTime.now()
        .plusSeconds(jwtUtil.getExpiration() / 1000);

    return AuthResponse.of(token, expiresAt, user.getUsername(),
        user.getDisplayName(), user.getId());
  }

  // ==================== 私有方法 ====================

  /**
   * 校验验证码，校验失败抛出 BusinessException
   */
  private void validateCaptcha(String captchaKey, String captchaCode) {
    if (captchaKey == null || captchaCode == null || captchaKey.isBlank() || captchaCode.isBlank()) {
      throw new BusinessException(ErrorCode.CAPTCHA_INVALID, "验证码不能为空");
    }

    boolean valid = captchaService.validateCaptcha(captchaKey, captchaCode);
    if (!valid) {
      // 先查一下 key 是否还存在，区分"过期"和"错误"
      String redisKey = "captcha:" + captchaKey;
      // 无法区分是过期还是错误，统一给友好提示
      throw new BusinessException(ErrorCode.CAPTCHA_INVALID, "验证码错误或已过期，请重新获取");
    }
  }
}
