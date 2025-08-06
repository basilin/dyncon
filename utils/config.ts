// Configuration type definitions and utilities
export interface AppConfig {
  apiUrl: string;
  environment: string;
  features: {
    enableFeatureX: boolean;
  };
}

// Default configuration fallback
const DEFAULT_CONFIG: AppConfig = {
  apiUrl: 'https://default.example.com',
  environment: 'default',
  features: {
    enableFeatureX: false
  }
};

// Configuration validation
const validateConfig = (config: any): config is AppConfig => {
  return (
    typeof config === 'object' &&
    typeof config.apiUrl === 'string' &&
    typeof config.environment === 'string' &&
    typeof config.features === 'object' &&
    typeof config.features.enableFeatureX === 'boolean'
  );
};

// Get configuration with fallback and validation
export const getConfig = (): AppConfig => {
  if (typeof window !== 'undefined') {
    // Client-side: read from injected runtime config
    const windowConfig = (window as any).__APP_CONFIG__;
    
    if (windowConfig && validateConfig(windowConfig)) {
      console.log('Valid runtime config loaded:', windowConfig);
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

// For development: log config loading
if (typeof window !== 'undefined') {
  console.log('Config module loaded on client side');
}
