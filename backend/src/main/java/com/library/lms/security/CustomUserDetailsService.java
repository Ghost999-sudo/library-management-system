package com.library.lms.security;

import com.library.lms.entity.User;
import com.library.lms.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Login form calls this with either the username or the email. */
    @Override
    @Transactional(readOnly = true)
    public CustomUserPrincipal loadUserByUsername(String usernameOrEmail) {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid username or password"));
        return new CustomUserPrincipal(user);
    }

    /** JWT filter calls this with the numeric subject from the token. */
    @Transactional(readOnly = true)
    public CustomUserPrincipal loadPrincipalById(Long userId) {
        return userRepository.findById(userId)
                .map(CustomUserPrincipal::new)
                .orElse(null);
    }
}
