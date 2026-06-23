package interview.guide.modules.user.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度需在3-50个字符之间")
    String username,

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 100, message = "密码长度需在6-100个字符之间")
    String password,

    String displayName,

    String email
) {}
