package com.sankalp.backend.security;

import com.sankalp.backend.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, CustomUserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        // 1. Secured Administrative / Nodal Officer Endpoints
                        .requestMatchers(HttpMethod.PUT, "/api/challenges/*/override-priority").hasAnyRole("NODAL_ADMIN", "ADMIN", "OFFICER", "GRAM_PANCHAYAT")
                        .requestMatchers(HttpMethod.POST, "/api/challenges/*/separate-cluster").hasAnyRole("NODAL_ADMIN", "ADMIN", "OFFICER", "GRAM_PANCHAYAT")
                        .requestMatchers(HttpMethod.PUT, "/api/challenges/*/status").hasAnyRole("NODAL_ADMIN", "ADMIN", "OFFICER", "GRAM_PANCHAYAT", "HEI_FACULTY", "INDUSTRY_PARTNER")
                        .requestMatchers(HttpMethod.POST, "/api/challenges/*/allocate").hasAnyRole("NODAL_ADMIN", "ADMIN")
                        // 2. Residential Society Platform Endpoints
                        .requestMatchers(HttpMethod.GET, "/api/society/organizations").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/society/issues/*/status").hasAnyRole("SOCIETY_MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/society/issues/*/separate-cluster").hasAnyRole("SOCIETY_MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/society/metrics").hasAnyRole("SOCIETY_MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/society/staff").hasAnyRole("SOCIETY_MANAGER", "ADMIN")
                        .requestMatchers("/api/society/**").hasAnyRole("SOCIETY_RESIDENT", "SOCIETY_MANAGER", "ADMIN")
                        // 3. Public / Citizen Endpoints
                        .requestMatchers(HttpMethod.GET, "/api/challenges/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/challenges", "/api/challenges/").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/challenges/*/upvote").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/challenges/*/verify-pilot").permitAll()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
