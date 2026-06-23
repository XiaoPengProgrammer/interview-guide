package interview.guide.common.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置
 * 注册 JWT 认证拦截器（仅拦截 /api/** 路径）
 *
 * 无 Spring Security，不影响 CORS、WebSocket 等任何现有配置
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

  private final AuthInterceptor authInterceptor;

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(authInterceptor)
        .addPathPatterns("/api/**")        // 只拦截 API 路径
        .excludePathPatterns("/api/auth/**"); // 注册/登录接口不需要认证
  }
}
