# CORS Configuration for Spring Boot Service

To fix the "Failed to fetch" error, you need to configure CORS in your Spring Boot application to allow requests from the Next.js frontend.

## Option 1: Global CORS Configuration

Add this configuration class to your Spring Boot application:

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
                .allowedOrigins("http://localhost:3000") // Next.js development server
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## Option 2: Controller-Level CORS

Alternatively, add the `@CrossOrigin` annotation to your UploadController:

```java
package com.hiomiai.upload_minioservice.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/upload")
@CrossOrigin(origins = "http://localhost:3000") // Add this line
public class UploadController {
    // ... existing code ...
}
```

## Option 3: Security Configuration (if using Spring Security)

If you're using Spring Security, add this configuration:

```java
package com.hiomiai.upload_minioservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## Testing the Connection

1. **Check if your Spring Boot service is running:**

   ```bash
   curl http://localhost:8080/upload
   ```

2. **Test CORS preflight request:**

   ```bash
   curl -X OPTIONS http://localhost:8080/upload \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -v
   ```

3. **Check browser console** for more detailed error messages after adding the CORS configuration.

## Common Issues

1. **Service not running**: Make sure your Spring Boot application is started on port 8080
2. **Wrong port**: Verify the service is running on the correct port
3. **CORS not configured**: Add one of the CORS configurations above
4. **Firewall/Network**: Check if there are any network restrictions

## Environment-Specific Configuration

For production, you might want to make the allowed origins configurable:

```java
@Value("${app.cors.allowed-origins:http://localhost:3000}")
private String allowedOrigins;

// Then use allowedOrigins instead of hardcoded "http://localhost:3000"
```

Add to `application.properties`:

```properties
app.cors.allowed-origins=http://localhost:3000,https://yourdomain.com
```


