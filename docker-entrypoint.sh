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

echo "Configuration generated successfully!"
echo "API_URL: ${API_URL:-https://default.example.com}"
echo "ENVIRONMENT: ${ENVIRONMENT:-production}"
echo "ENABLE_FEATURE_X: ${ENABLE_FEATURE_X:-false}"

# Start nginx
exec "$@"
