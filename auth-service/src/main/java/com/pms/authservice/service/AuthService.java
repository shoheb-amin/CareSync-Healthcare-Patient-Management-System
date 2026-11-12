package com.pms.authservice.service;

import com.pms.authservice.config.SecurityConfig;
import com.pms.authservice.dto.LoginRequestDTO;
import com.pms.authservice.model.User;
import com.pms.authservice.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final SecurityConfig securityConfig;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // password request -> password -> encoded -> fdjlsafjldfj#$#ljslf
    public Optional<String> authenticate(LoginRequestDTO loginRequestDTO) {
        Optional<String> token=userService.findByEmail(loginRequestDTO.getEmail())
                .filter(u->passwordEncoder.matches(loginRequestDTO.getPassword(),
                        u.getPassword()))
                .map(u->jwtUtil.generateToken(u.getEmail(),u.getRole()));
        return token;
    }

    public boolean validateToken(String token) {
        try{
            jwtUtil.validateToken(token);
            return true;
        }catch(JwtException e){
            return false;
        }
    }

}
