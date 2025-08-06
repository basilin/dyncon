'use client'

import { useEffect, useState } from 'react';
import { type AppConfig } from './config';

// Default configuration fallback (duplicated here to avoid hydration issues)
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

// Client-side only config getter
const getClientConfig = (): AppConfig => {
  if (typeof window !== 'undefined') {
    const windowConfig = (window as any).__APP_CONFIG__;
    
    if (windowConfig && validateConfig(windowConfig)) {
      console.log('Valid runtime config loaded:', windowConfig);
      return windowConfig;
    } else {
      console.warn('Invalid or missing runtime config, using fallback');
    }
  }
  return DEFAULT_CONFIG;
};

const useConfig = (): AppConfig => {
  // Always start with default config to prevent hydration mismatch
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    // Only update config after hydration is complete
    const clientConfig = getClientConfig();
    setConfig(clientConfig);
    
    console.log('useConfig: Client-side config updated after hydration:', clientConfig);
  }, []);

  return config;
};

export default useConfig;
