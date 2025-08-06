# Runtime Parameter Injection Documentation

## Overview

This document provides a detailed explanation of how runtime parameter injection works in the DynCon Next.js application. The implementation allows for dynamic configuration of application parameters at container startup time, enabling the same build artifact to be deployed across multiple environments (development, staging, production) with different configurations.

## Architecture Overview

The runtime parameter injection system consists of several key components working together:

1. **Static Build Configuration** - Next.js static export setup
2. **Runtime Configuration Injection** - Dynamic config generation at container startup
3. **Client-Side Configuration Loading** - TypeScript utilities for config consumption
4. **Docker Container Setup** - Container orchestration with environment variables
5. **Development Tools** - PowerShell scripts for local development

## Core Components

### 1. Next.js Static Export Configuration

**File**: `next.config.js`

```javascript
const nextConfig = {
  output: 'export',        // Static export for containerization
  trailingSlash: true,     // Consistent routing
  images: {
    unoptimized: true      // Required for static export
  }
}
```

**Purpose**: Configures Next.js to generate a static export that can be served by any web server (nginx in this case), enabling containerization without Node.js runtime.

### 2. Configuration Type System

**File**: `utils/config.ts`

```typescript
export interface AppConfig {
  apiUrl: string;
  environment: string;
  features: {
    enableFeatureX: boolean;
  };
}
```

**Key Features**:
- **Type Safety**: Full TypeScript interface for configuration structure
- **Validation**: Runtime validation of injected configuration
- **Fallback Mechanism**: Default configuration when runtime config is invalid/missing
- **Dual Environment Support**: Different behavior for server-side vs client-side

**Configuration Loading Logic**:
```typescript
export const getConfig = (): AppConfig => {
  if (typeof window !== 'undefined') {
    // Client-side: read from injected runtime config
    const windowConfig = (window as any).__APP_CONFIG__;
    
    if (windowConfig && validateConfig(windowConfig)) {
      return windowConfig;
    } else {
      console.warn('Invalid or missing runtime config, using fallback');
      return DEFAULT_CONFIG;
    }
  }
  
  // Server-side: read from environment variables (for build time)
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || DEFAULT_CONFIG.apiUrl,
    environment: process.env.NODE_ENV || DEFAULT_CONFIG.environment,
    features: {
      enableFeatureX: process.env.NEXT_PUBLIC_ENABLE_FEATURE_X === 'true'
    }
  };
};
```

### 3. React Hook for Configuration

**File**: `utils/useConfig.ts`

```typescript
const useConfig = (): AppConfig => {
  const [config, setConfig] = useState<AppConfig>(() => {
    return getConfig();
  });

  useEffect(() => {
    // Update config once client-side hydration is complete
    const clientConfig = getConfig();
    setConfig(clientConfig);
  }, []);

  return config;
};
```

**Purpose**: 
- Provides a React hook for consuming configuration in components
- Handles hydration mismatch between server and client
- Ensures configuration is updated after client-side JavaScript loads

### 4. Runtime Configuration Injection

**File**: `app/layout.tsx`

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="/config.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

**Critical Details**:
- `strategy="beforeInteractive"`: Ensures config loads before React hydration
- `/config.js`: Dynamically generated configuration file
- Global `window.__APP_CONFIG__`: Configuration object available to all components

### 5. Docker Runtime Configuration Generation

**File**: `docker-entrypoint.sh`

```bash
#!/bin/sh

# Generate config.js from environment variables at container startup
echo "Generating runtime configuration..."

cat > /usr/share/nginx/html/config.js << EOF
window.__APP_CONFIG__ = {
  apiUrl: '${API_URL:-https://default.example.com}',
  environment: '${ENVIRONMENT:-production}',
  features: {
    enableFeatureX: ${ENABLE_FEATURE_X:-false}
  }
};
console.log('Runtime config loaded:', window.__APP_CONFIG__);
EOF

# Start nginx
exec "$@"
```

**Key Features**:
- **Dynamic Generation**: Creates `config.js` at container startup
- **Environment Variable Mapping**: Maps Docker environment variables to configuration
- **Default Values**: Provides fallbacks using shell parameter expansion (`${VAR:-default}`)
- **Logging**: Outputs configuration for debugging

### 6. Dockerfile Multi-Stage Build

**File**: `Dockerfile`

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS runner
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

**Architecture Benefits**:
- **Separation of Concerns**: Build artifacts separate from runtime configuration
- **Small Production Image**: Only nginx + static files in final image
- **Runtime Flexibility**: Same image can run in any environment

## Configuration Flow

### 1. Build Time (Development)

```
Developer writes code → Next.js builds static files → Docker builds container image
```

- Configuration interfaces and utilities are compiled into the build
- No runtime values are embedded in the build
- Static files are prepared for serving

### 2. Container Startup (Runtime)

```
Container starts → docker-entrypoint.sh runs → Environment variables → config.js generated → nginx starts
```

**Detailed Flow**:
1. Docker container receives environment variables (API_URL, ENVIRONMENT, ENABLE_FEATURE_X)
2. `docker-entrypoint.sh` executes before nginx starts
3. Script generates `/usr/share/nginx/html/config.js` with runtime values
4. Nginx starts and serves static files including the generated config

### 3. Client-Side Loading (Browser)

```
Browser loads page → config.js loads before React → React hydrates → useConfig hook provides config
```

**Detailed Flow**:
1. HTML page loads with `<script src="/config.js" strategy="beforeInteractive">`
2. `config.js` executes, setting `window.__APP_CONFIG__`
3. React components render server-side with default/environment config
4. Client-side hydration occurs, `useConfig` hook detects runtime config
5. Components re-render with actual runtime configuration

## Environment-Specific Configurations

### Development Environment

**File**: `docker-compose.dev.yml`

```yaml
environment:
  - API_URL=https://dev.example.com
  - ENVIRONMENT=development
  - ENABLE_FEATURE_X=true
```

### Production Environment

**File**: `docker-compose.prod.yml`

```yaml
environment:
  - API_URL=https://api.example.com
  - ENVIRONMENT=production
  - ENABLE_FEATURE_X=false
```

## Configuration Examples

### Static Config Files

**Development** (`dev/config.js`):
```javascript
window.__APP_CONFIG__ = {
  apiUrl: 'https://dev.example.com',
  environment: 'development',
  features: {
    enableFeatureX: true
  }
};
```

**Production** (`public/config.js`):
```javascript
window.__APP_CONFIG__ = {
  apiUrl: 'https://api.example.com',
  environment: 'production',
  features: {
    enableFeatureX: true
  }
};
```

## Component Integration

### Using Configuration in Components

**File**: `components/ConfigDisplay.tsx`

```tsx
'use client'
import useConfig from '../utils/useConfig';

export default function ConfigDisplay() {
  const config = useConfig();

  return (
    <div>
      <h2>Configuration</h2>
      <p><strong>API URL:</strong> {config.apiUrl}</p>
      <p><strong>Environment:</strong> {config.environment}</p>
      <p><strong>Feature X:</strong> {config.features?.enableFeatureX ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

**Key Points**:
- Must use `'use client'` directive for client-side configuration access
- `useConfig()` hook handles all configuration loading logic
- Type-safe access to configuration properties

## Security Considerations

### 1. Client-Side Exposure

**Important**: All configuration values are exposed to the client-side JavaScript. Never include sensitive data like:
- API keys
- Database passwords
- Internal service URLs
- Authentication tokens

### 2. Validation

The system includes runtime validation to prevent injection of malformed configuration:

```typescript
const validateConfig = (config: any): config is AppConfig => {
  return (
    typeof config === 'object' &&
    typeof config.apiUrl === 'string' &&
    typeof config.environment === 'string' &&
    typeof config.features === 'object' &&
    typeof config.features.enableFeatureX === 'boolean'
  );
};
```

## Deployment Strategies

### 1. Single Build, Multiple Environments

```
Build Once → Deploy to Dev → Deploy to Staging → Deploy to Production
     ↓              ↓               ↓                    ↓
Same Image    API_URL=dev     API_URL=staging    API_URL=prod
```

### 2. Environment Variables Sources

- **Docker Compose**: Environment-specific files
- **Kubernetes**: ConfigMaps and Secrets
- **Cloud Platforms**: Environment variable configuration
- **CI/CD Pipelines**: Build-time variable injection

### 3. Configuration Management

**Best Practices**:
1. Use environment-specific docker-compose files
2. Store sensitive config in external secret management
3. Validate configuration at container startup
4. Log configuration loading for debugging
5. Provide meaningful defaults for all values

