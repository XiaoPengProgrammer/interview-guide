package interview.guide.common.auth;

import interview.guide.common.annotation.RequireAuth;
import interview.guide.common.exception.BusinessException;
import interview.guide.common.exception.ErrorCode;
import interview.guide.modules.user.entity.UserEntity;
import interview.guide.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * JWT 认证拦截器
 *
 * - 对每个请求都尝试提取 Token（如果有的话），将用户信息注入 request attribute
 * - 只有标记了 @RequireAuth 的接口才会在校验失败时阻断请求
 * - Controller/Service 可通过 CurrentUser.getUserId() 获取当前登录用户
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

  private final JwtUtil jwtUtil;
  private final UserRepository userRepository;

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
      Object handler) throws Exception {
    if (!(handler instanceof HandlerMethod handlerMethod)) {
      return true;
    }

    // 尝试提取 Token（不阻断请求）
    String token = extractToken(request);
    Long userId = null;
    String username = null;

    if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
      username = jwtUtil.getUsername(token);
      // 从数据库查找 userId
      userId = userRepository.findByUsername(username)
          .map(UserEntity::getId)
          .orElse(null);
    }

    // 将用户信息存入 request（Controller/Service 可以通过 CurrentUser 获取）
    request.setAttribute("currentUserId", userId);
    request.setAttribute("currentUsername", username);

    // 检查是否需要强制认证
    RequireAuth requireAuth = handlerMethod.getMethodAnnotation(RequireAuth.class);
    if (requireAuth == null) {
      requireAuth = handlerMethod.getBeanType().getAnnotation(RequireAuth.class);
    }

    if (requireAuth != null && userId == null) {
      throw new BusinessException(ErrorCode.USER_TOKEN_MISSING, "缺少认证Token或Token无效");
    }

    return true;
  }

  private String extractToken(HttpServletRequest request) {
    String bearerToken = request.getHeader("Authorization");
    if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    return null;
  }
}
