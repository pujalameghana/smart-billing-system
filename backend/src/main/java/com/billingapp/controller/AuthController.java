package com.billingapp.controller;

import com.billingapp.dto.AuthRequest;
import com.billingapp.dto.AuthResponse;
import com.billingapp.dto.GoogleAuthRequest;
import com.billingapp.dto.RegisterRequest;
import com.billingapp.model.Business;
import com.billingapp.model.User;
import com.billingapp.repository.BusinessRepository;
import com.billingapp.repository.UserRepository;
import com.billingapp.security.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          BusinessRepository businessRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest loginRequest) {
        String usernameOrEmail = loginRequest.getUsernameOrEmail();

        Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail));

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid username or password");
        }

        User user = userOpt.get();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtil.generateToken(user.getUsername());

        List<Business> userBusinesses = businessRepository.findByOwnerId(user.getId());
        Long defaultBusinessId = userBusinesses.isEmpty() ? null : userBusinesses.get(0).getId();

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                defaultBusinessId
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already in use!");
        }

        User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getFullName() != null && !registerRequest.getFullName().isEmpty()
                        ? registerRequest.getFullName()
                        : registerRequest.getUsername()
        );
        user.setRole("ROLE_USER");
        user.setAuthProvider("LOCAL");

        user = userRepository.save(user);

        // Auto-create initial business if companyName provided
        Long defaultBusinessId = null;
        String companyName = registerRequest.getCompanyName();
        if (companyName != null && !companyName.trim().isEmpty()) {
            Business business = new Business();
            business.setName(companyName.trim());
            business.setEmail(registerRequest.getEmail());
            business.setOwner(user);
            business.setCurrency("₹");
            business.setTaxPercentage(18.0);
            business.setInvoicePrefix("INV");
            business = businessRepository.save(business);
            defaultBusinessId = business.getId();
        }

        String token = jwtUtil.generateToken(user.getUsername());

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                defaultBusinessId
        ));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody GoogleAuthRequest googleRequest) {
        String email = googleRequest.getEmail();
        String name = googleRequest.getName();
        String picture = googleRequest.getPicture();

        // If a Google JWT credential was provided, decode its payload
        if (googleRequest.getCredential() != null && !googleRequest.getCredential().isEmpty()) {
            try {
                String[] parts = googleRequest.getCredential().split("\\.");
                if (parts.length >= 2) {
                    byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
                    JsonNode payloadNode = objectMapper.readTree(new String(decoded, StandardCharsets.UTF_8));
                    if (payloadNode.has("email")) {
                        email = payloadNode.get("email").asText();
                    }
                    if (payloadNode.has("name")) {
                        name = payloadNode.get("name").asText();
                    }
                    if (payloadNode.has("picture")) {
                        picture = payloadNode.get("picture").asText();
                    }
                }
            } catch (Exception ex) {
                System.err.println("Could not parse Google credential token: " + ex.getMessage());
            }
        }

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Google authentication failed: email is missing.");
        }

        email = email.trim().toLowerCase();
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        User user;

        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (picture != null && (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty())) {
                user.setAvatarUrl(picture);
                userRepository.save(user);
            }
        } else {
            // New user from Google
            String username = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
            if (userRepository.existsByUsername(username)) {
                username = username + "_" + UUID.randomUUID().toString().substring(0, 4);
            }

            user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setFullName(name != null && !name.isEmpty() ? name : username);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // randomized password
            user.setRole("ROLE_USER");
            user.setAuthProvider("GOOGLE");
            user.setAvatarUrl(picture);
            user = userRepository.save(user);

            // Auto create company for new Google user
            String compName = (googleRequest.getCompanyName() != null && !googleRequest.getCompanyName().trim().isEmpty())
                    ? googleRequest.getCompanyName().trim()
                    : user.getFullName() + "'s Enterprise";

            Business business = new Business();
            business.setName(compName);
            business.setEmail(email);
            business.setOwner(user);
            business.setCurrency("₹");
            business.setTaxPercentage(18.0);
            business.setInvoicePrefix("INV");
            businessRepository.save(business);
        }

        String token = jwtUtil.generateToken(user.getUsername());
        List<Business> userBusinesses = businessRepository.findByOwnerId(user.getId());
        Long defaultBusinessId = userBusinesses.isEmpty() ? null : userBusinesses.get(0).getId();

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                defaultBusinessId
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Business> userBusinesses = businessRepository.findByOwnerId(user.getId());
        Long defaultBusinessId = userBusinesses.isEmpty() ? null : userBusinesses.get(0).getId();

        return ResponseEntity.ok(new AuthResponse(
                null,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                defaultBusinessId
        ));
    }
}
