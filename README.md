# DynCon - Dynamic Configuration Next.js App

This is a [Next.js](https://nextjs.org/) project with runtime configuration management using environment variables.

## Configuration Strategy

This application uses **runtime environment variable injection** for configuration management, eliminating the need for manual file copying or container restarts when updating configuration.

### How It Works

1. **Environment Variables**: Configuration is defined using environment variables
2. **Runtime Injection**: Docker entrypoint script generates `config.js` at container startup
3. **Type Safety**: TypeScript interfaces ensure configuration validity
4. **Fallback Support**: Graceful degradation when configuration is missing

## Getting Started

### Local Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Docker Development

Use the new PowerShell script for environment-specific deployments:

```powershell
# Development environment
.\run-with-config.ps1 -Environment dev

# Production environment  
.\run-with-config.ps1 -Environment prod

# Custom configuration
.\run-with-config.ps1 -Environment dev -ApiUrl "https://custom-api.com" -EnableFeatureX "true"

# Rebuild container
.\run-with-config.ps1 -Environment dev -Rebuild
```

### Using Docker Compose

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.prod.yml up
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | API endpoint URL | `https://default.example.com` |
| `ENVIRONMENT` | Application environment | `production` |
| `ENABLE_FEATURE_X` | Enable feature X flag | `false` |

### Adding New Configuration

1. Update `utils/config.ts` interface and getConfig function
2. Update `docker-entrypoint.sh` to inject the new variable
3. Update `.env.example` with documentation

## Migration from Old Approach

The old manual file copying approach (`update-config.ps1`) has been replaced with:
- ✅ Environment variable injection
- ✅ No manual file copying required  
- ✅ No container restarts needed for config changes
- ✅ Type-safe configuration
- ✅ Multiple environment support

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
