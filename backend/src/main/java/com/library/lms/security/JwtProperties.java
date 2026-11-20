package com.library.lms.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/** JWT settings, supplied through environment variables in every non-local environment. */
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    /**
     * Base64-encoded 256-bit (or stronger) key. When blank, JwtTokenService generates
     * a random per-startup key for local development and tests.
     */
    private String secret;

    /** Token lifetime in milliseconds. */
    @Positive
    private long expirationMs = 3_600_000L;

    @NotBlank
    private String issuer = "library-management-system";

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    public void setExpirationMs(long expirationMs) {
        this.expirationMs = expirationMs;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }
}
