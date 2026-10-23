package com.sankalp.backend.service;

import com.sankalp.backend.dto.AuthResponse;
import com.sankalp.backend.dto.LoginRequest;
import com.sankalp.backend.dto.RegisterRequest;
import com.sankalp.backend.entity.User;
import com.sankalp.backend.repository.UserRepository;
import com.sankalp.backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already registered in Innovation Portal");
        }

        User user = new User(
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password()),
                request.role() != null ? request.role() : User.Role.CITIZEN,
                request.district() != null ? request.district() : "Ranchi"
        );
        user.setOrganizationName(request.organizationName());
        user.setOrganizationId(request.organizationId());

        User saved = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(
                "Registration successful",
                token,
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getRole().name(),
                saved.getOrganizationId(),
                saved.getOrganizationName(),
                saved.getDistrict()
        );
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.email());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(
                "Login successful",
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getOrganizationId(),
                user.getOrganizationName(),
                user.getDistrict()
        );
    }
}
