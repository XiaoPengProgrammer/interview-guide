package interview.guide.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 标记需要登录认证的接口
 *
 * 在 Controller 方法上添加此注解后，请求时需在 Header 中携带有效的 JWT Token：
 * Authorization: Bearer {token}
 *
 * 未添加此注解的接口全部公开访问，不受影响。
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireAuth {
}
