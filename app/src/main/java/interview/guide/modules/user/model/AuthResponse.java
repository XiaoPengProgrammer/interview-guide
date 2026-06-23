package interview.guide.modules.user.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record AuthResponse(
    String token,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime expiresAt,
    String tokenType,
    String username,
    String displayName,
    Long userId
) {

  public static AuthResponse of(String token, LocalDateTime expiresAt,
      String username, String displayName, Long userId) {
    return new AuthResponse(token, expiresAt, "Bearer", username, displayName, userId);
  }
}
