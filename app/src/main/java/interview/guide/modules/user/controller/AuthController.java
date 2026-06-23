package interview.guide.modules.user.controller;

import interview.guide.common.result.Result;
import interview.guide.modules.user.model.AuthResponse;
import interview.guide.modules.user.model.LoginRequest;
import interview.guide.modules.user.model.RegisterRequest;
import interview.guide.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final UserService userService;

  @PostMapping("/register")
  public Result<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    log.info("注册请求: username={}", request.username());
    return Result.success(userService.register(request));
  }

  @PostMapping("/login")
  public Result<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    log.info("登录请求: username={}", request.username());
    return Result.success(userService.login(request));
  }
}
