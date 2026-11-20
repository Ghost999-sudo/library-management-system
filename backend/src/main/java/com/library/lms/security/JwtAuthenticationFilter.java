package com.library.lms.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/** Converts a valid Authorization: Bearer token into a Spring Security authentication. */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenService tokenService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenService tokenService,
                                   CustomUserDetailsService userDetailsService) {
        this.tokenService = tokenService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(BEARER_PREFIX)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = header.substring(BEARER_PREFIX.length()).trim();
            try {
                JwtTokenService.AuthenticatedToken authenticated = tokenService.parse(token);
                CustomUserPrincipal principal =
                        userDetailsService.loadPrincipalById(authenticated.userId());

                // Authorities come from the current database record, not the token claim, so a
                // role change takes effect even while an older token is still valid.
                if (principal != null && principal.isEnabled()) {
                    var authorities = principal.getAuthorities().stream()
                            .map(authority -> new SimpleGrantedAuthority(authority.getAuthority()))
                            .toList();
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(principal, null, authorities);
                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (JwtException | IllegalArgumentException e) {
                // Malformed, expired or unknown user: leave the request unauthenticated.
                // Spring Security's entry point will return the standard 401 JSON body.
            }
        }
        filterChain.doFilter(request, response);
    }
}
