# Spring Boot CORS Fix - Comprehensive Guide

Since you've already added `@CrossOrigin` but it's still not working, let's try a more comprehensive approach.

## Option 1: Global CORS Configuration (Recommended)

Create a new configuration class in your Spring Boot application:

```java
package com.hiomiai.upload_minioservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*") // More permissive than allowedOrigins
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .exposedHeaders("*")
                .allowCredentials(false) // Set to false if you don't need credentials
                .maxAge(3600);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("*"); // More permissive
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(false); // Set to false if you don't need credentials

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## Option 2: Update Your Controller

Update your UploadController to be more permissive:

```java
package com.hiomiai.upload_minioservice.controller;

import com.hiomiai.upload_minioservice.services.MinioUploadService;
import com.hiomiai.upload_minioservice.ml.MlServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/upload")
@CrossOrigin(
    origins = "*", // More permissive
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)
public class UploadController {
    private static final Logger log = LoggerFactory.getLogger(UploadController.class);

    private final MinioUploadService uploadService;
    private final MlServiceClient mlServiceClient;

    public UploadController(MinioUploadService uploadService, MlServiceClient mlServiceClient) {
        this.uploadService = uploadService;
        this.mlServiceClient = mlServiceClient;
    }

    @PostMapping
    public ResponseEntity<String> upload(
        @RequestParam("file") MultipartFile file
    ) throws IOException {
        String userId = "1";
        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();
        long size = file.getSize();

        log.info("Received upload request for file: {} (size: {}, type: {})", fileName, size, contentType);

        uploadService.uploadFile(fileName, file.getBytes(), contentType);

        try {
            mlServiceClient.notifyUpload(fileName, userId, contentType, size);
        } catch (Exception e) {
            log.warn("ML notify failed for file '{}' (userId={}): {}", fileName, userId, e.getMessage());
        }

        return ResponseEntity.ok("Uploaded");
    }

    // Add a simple health check endpoint
    @GetMapping
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Upload service is running");
    }
}
```

## Option 3: Application Properties

Add these properties to your `application.properties` or `application.yml`:

```properties
# CORS Configuration
spring.web.cors.allowed-origins=*
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=false
spring.web.cors.max-age=3600
```

## Option 4: Test with curl

Test your Spring Boot service directly with curl to make sure it's working:

```bash
# Test the health endpoint
curl -v http://localhost:8080/upload

# Test CORS preflight
curl -X OPTIONS http://localhost:8080/upload \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Test actual upload
curl -X POST http://localhost:8080/upload \
  -F "file=@test.txt" \
  -H "Origin: http://localhost:3000" \
  -v
```

## Option 5: Check for Spring Security

If you have Spring Security in your dependencies, you might need to configure it:

```java
package com.hiomiai.upload_minioservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests()
            .anyRequest().permitAll();
        return http.build();
    }
}
```

## Debugging Steps

1. **Check if Spring Boot is running:**

   ```bash
   curl http://localhost:8080/upload
   ```

2. **Check CORS headers in browser:**

   - Open browser dev tools
   - Go to Network tab
   - Try the upload
   - Look for the OPTIONS request and check response headers

3. **Check Spring Boot logs:**

   - Look for any CORS-related errors in your Spring Boot console

4. **Try the connection test component:**
   - Use the "Test CORS" and "Test Upload" buttons in the frontend
   - Check the browser console for detailed logs

## Common Issues

1. **Spring Security blocking requests** - Add the SecurityConfig above
2. **Wrong port** - Make sure Spring Boot is running on port 8080
3. **Firewall/Network** - Check if there are any network restrictions
4. **Browser cache** - Try hard refresh (Ctrl+F5) or incognito mode

Try these solutions in order and let me know what the connection test shows!


