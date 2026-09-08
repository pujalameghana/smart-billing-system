package com.billingapp.dto;

public class AuthResponse {
    private String token;
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private Long defaultBusinessId;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long id, String username, String email, String fullName, String role, Long defaultBusinessId) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.defaultBusinessId = defaultBusinessId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getDefaultBusinessId() {
        return defaultBusinessId;
    }

    public void setDefaultBusinessId(Long defaultBusinessId) {
        this.defaultBusinessId = defaultBusinessId;
    }
}
