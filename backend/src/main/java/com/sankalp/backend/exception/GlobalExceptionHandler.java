package com.sankalp.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(org.springframework.security.access.AccessDeniedException exception) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", exception.getMessage(), "error", "Forbidden"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException exception) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", exception.getMessage()));
    }
}
