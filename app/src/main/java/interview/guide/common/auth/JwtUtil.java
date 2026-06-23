package interview.guide.common.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 工具类
 * 纯工具组件，不依赖 Spring Security，零侵入
 */
@Slf4j
@Component
public class JwtUtil {

  @Value("${app.jwt.secret:interview-guide-jwt-secret-key-2024-must-be-256-bits}")
  private String secret;

  @Value("${app.jwt.expiration:86400000}")
  private long expiration;

  private SecretKey signingKey;

  @PostConstruct
  public void init() {
    this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    log.info("JwtUtil initialized, expiration={}ms", expiration);
  }

  /**
   * 生成 JWT Token
   */
  public String generateToken(String username) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + expiration);

    return Jwts.builder()
        .subject(username)
        .issuedAt(now)
        .expiration(expiryDate)
        .signWith(signingKey)
        .compact();
  }

  /**
   * 从 Token 提取用户名
   */
  public String getUsername(String token) {
    return parseToken(token).getSubject();
  }

  /**
   * 校验 Token 是否有效
   */
  public boolean validateToken(String token) {
    try {
      parseToken(token);
      return true;
    } catch (ExpiredJwtException e) {
      log.debug("Token已过期");
      return false;
    } catch (UnsupportedJwtException | MalformedJwtException | SecurityException e) {
      log.debug("Token无效: {}", e.getMessage());
      return false;
    } catch (Exception e) {
      log.debug("Token校验异常: {}", e.getMessage());
      return false;
    }
  }

  /**
   * 获取 Token 过期时间
   */
  public long getExpiration() {
    return expiration;
  }

  private Claims parseToken(String token) {
    return Jwts.parser()
        .verifyWith(signingKey)
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }
}
