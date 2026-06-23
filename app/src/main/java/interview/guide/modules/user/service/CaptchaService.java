package interview.guide.modules.user.service;

import interview.guide.infrastructure.redis.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

/**
 * 图形验证码服务
 * <p>
 * 生成随机验证码图片，验证码文本存入 Redis（5 分钟过期），
 * 返回 captchaKey（UUID）和 base64 图片给前端。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CaptchaService {

    private static final String CAPTCHA_PREFIX = "captcha:";
    private static final Duration CAPTCHA_TTL = Duration.ofMinutes(5);
    private static final int WIDTH = 120;
    private static final int HEIGHT = 40;
    private static final int CODE_LENGTH = 4;
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 排除易混淆的 0/O/I/1

    private final RedisService redisService;
    private final SecureRandom random = new SecureRandom();

    /**
     * 生成验证码
     *
     * @return Map 包含 captchaKey 和 captchaImage（base64 PNG）
     */
    public Map<String, String> generateCaptcha() {
        String code = generateCode();
        String captchaKey = UUID.randomUUID().toString();

        // 存入 Redis
        redisService.set(CAPTCHA_PREFIX + captchaKey, code, CAPTCHA_TTL);

        // 生成图片
        String base64Image = generateImage(code);

        log.debug("验证码已生成: key={}", captchaKey);
        return Map.of(
            "captchaKey", captchaKey,
            "captchaImage", "data:image/png;base64," + base64Image
        );
    }

    /**
     * 校验验证码（校验后立即删除，一次性使用）
     *
     * @param captchaKey 验证码 key
     * @param captchaCode 用户输入的验证码
     * @return true 通过，false 不通过
     */
    public boolean validateCaptcha(String captchaKey, String captchaCode) {
        if (captchaKey == null || captchaCode == null) {
            return false;
        }

        String redisKey = CAPTCHA_PREFIX + captchaKey;
        String storedCode = redisService.get(redisKey);

        if (storedCode == null) {
            return false; // 过期或不存在
        }

        // 一次性使用，无论成功失败都删除
        redisService.delete(redisKey);

        return storedCode.equalsIgnoreCase(captchaCode.trim());
    }

    // ==================== 私有方法 ====================

    private String generateCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return sb.toString();
    }

    private String generateImage(String code) {
        BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();

        // 背景
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, WIDTH, HEIGHT);

        // 干扰线
        g.setColor(Color.LIGHT_GRAY);
        for (int i = 0; i < 6; i++) {
            int x1 = random.nextInt(WIDTH);
            int y1 = random.nextInt(HEIGHT);
            int x2 = random.nextInt(WIDTH);
            int y2 = random.nextInt(HEIGHT);
            g.drawLine(x1, y1, x2, y2);
        }

        // 干扰点
        g.setColor(Color.GRAY);
        for (int i = 0; i < 30; i++) {
            int x = random.nextInt(WIDTH);
            int y = random.nextInt(HEIGHT);
            g.fillRect(x, y, 2, 2);
        }

        // 绘制验证码
        g.setFont(new Font("Courier New", Font.BOLD | Font.ITALIC, 24));
        char[] chars = code.toCharArray();
        for (int i = 0; i < chars.length; i++) {
            // 每个字符随机颜色
            Color color = new Color(
                30 + random.nextInt(180),
                30 + random.nextInt(180),
                30 + random.nextInt(180)
            );
            g.setColor(color);

            // 每个字符随机旋转
            double angle = (random.nextDouble() - 0.5) * 0.6;
            g.rotate(angle, 25 + i * 25, 28);
            g.drawString(String.valueOf(chars[i]), 20 + i * 25, 30);
            g.rotate(-angle, 25 + i * 25, 28);
        }

        g.dispose();

        // 转 base64
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(image, "PNG", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (Exception e) {
            log.error("验证码图片生成失败", e);
            throw new RuntimeException("验证码图片生成失败", e);
        }
    }
}
