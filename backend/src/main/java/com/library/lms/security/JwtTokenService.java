package com.library.lms.security;

import com.library.lms.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Clock;
import java.util.Base64;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/** Creates and validates the signed access tokens used by the API. */
@Service
public class JwtTokenService {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenService.class);

    /** Parsed token data needed by the security filter. */
    public record AuthenticatedToken(Long userId, Set<String> roles) { }

    private final JwtProperties properties;
    private final Clock clock;
    private final SecretKey signingKey;

    public JwtTokenService(JwtProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
        this.signingKey = buildSigningKey(properties.getSecret());
    }

    /**
     * Uses the configured Base64-encoded 256-bit key. If none is configured (local runs/tests),
     * a random key is generated so no secret ever lives in source code.
     */
    private static SecretKey buildSigningKey(String configuredSecret) {
        if (configuredSecret == null || configuredSecret.isBlank()) {
            log.warn("JWT_SECRET is not set — generating a random key for this startup. "
                    + "Set JWT_SECRET to a persistent Base64-encoded 32+ byte key in production.");
            byte[] randomKey = new byte[32];
            new SecureRandom().nextBytes(randomKey);
            return Keys.hmacShaKeyFor(randomKey);
        }
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(configuredSecret.trim());
        } catch (IllegalArgumentException e) {
            keyBytes = configuredSecret.getBytes(StandardCharsets.UTF_8);
        }
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "jwt.secret must decode to at least 32 bytes (256 bits) for HS256");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(User user) {
        long now = clock.millis();
        return Jwts.builder()
                .subject(String.valueOf(user.getUserId()))
                .issuer(properties.getIssuer())
                .claim("username", user.getUsername())
                .claim("role", user.getRole().name())
                .issuedAt(new Date(now))
                .expiration(new Date(now + properties.getExpirationMs()))
                .signWith(signingKey)
                .compact();
    }

    /** Verifies signature, issuer and expiry in one parse, returning the id and role claim. */
    public AuthenticatedToken parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(properties.getIssuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Set<String> roles = new HashSet<>();
        Object roleClaim = claims.get("role");
        if (roleClaim instanceof String single) {
            roles.add(single);
        } else if (roleClaim instanceof List<?> list) {
            list.stream().filter(java.util.Objects::nonNull)
                    .forEach(item -> roles.add(item.toString()));
        }
        return new AuthenticatedToken(Long.valueOf(claims.getSubject()), roles);
    }

}
