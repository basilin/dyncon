'use client'

import { useEffect, useState } from 'react';
import useConfig from '../utils/useConfig';

export default function ConfigDisplay() {
  const config = useConfig();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      <h2>Configuration</h2>
      <p><strong>API URL:</strong> {config.apiUrl}</p>
      <p><strong>Environment:</strong> {config.environment}</p>
      <p><strong>Feature X Enabled:</strong> {config.features?.enableFeatureX ? 'Yes' : 'No'}</p>
      
      {isClient && (
        <>
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <strong>Full Config:</strong>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            <em>
              {config.apiUrl === 'https://default.example.com' 
                ? 'Using default configuration (runtime config not loaded)' 
                : 'Configuration loaded at runtime from environment variables'
              }
            </em>
          </div>
        </>
      )}
    </div>
  );
}
