package com.aeroops.dto;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
    Instant timestamp,
    int status,
    String error,
    String message,
    List<String> errors,
    String path
) {
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(Instant.now(), status, error, message, List.of(), path);
    }

    public static ErrorResponse of(int status, String error, String message, List<String> errors, String path) {
        return new ErrorResponse(Instant.now(), status, error, message, errors, path);
    }
}
