package interview.guide.common.auth;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * 获取当前登录用户信息的工具类
 *
 * 用法：在任何地方（Service、Controller）调用：
 * Long userId = CurrentUser.getUserId();
 * String username = CurrentUser.getUsername();
 *
 * 未登录时返回 null，不影响匿名访问的接口
 */
public class CurrentUser {

  private static final String USER_ID_ATTR = "currentUserId";
  private static final String USERNAME_ATTR = "currentUsername";

  /**
   * 获取当前登录用户的 ID
   * @return userId，未登录时返回 null
   */
  public static Long getUserId() {
    HttpServletRequest request = getRequest();
    return request != null ? (Long) request.getAttribute(USER_ID_ATTR) : null;
  }

  /**
   * 获取当前登录用户的用户名
   * @return username，未登录时返回 null
   */
  public static String getUsername() {
    HttpServletRequest request = getRequest();
    return request != null ? (String) request.getAttribute(USERNAME_ATTR) : null;
  }

  private static HttpServletRequest getRequest() {
    ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
    return attrs != null ? attrs.getRequest() : null;
  }
}
