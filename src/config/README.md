# API Keys Management

This directory contains configuration files for managing API keys and sensitive information securely.

## Files Structure

### 🔒 **Files NOT committed to git (contain real keys):**
- `apiKeys.ts` - Contains actual API keys for development
- `secrets.ts` - Contains sensitive information and secrets
- `.env` - Environment variables (if using .env files)

### ✅ **Files committed to git (safe to share):**
- `apiKeys.example.ts` - Example file with placeholder keys
- `secrets.example.ts` - Example file with placeholder secrets
- `config.ts` - Main configuration file
- `README.md` - This documentation

## Setup Instructions

### 1. **For Development:**
```bash
# Copy example files to create actual config files
cp src/config/apiKeys.example.ts src/config/apiKeys.ts
cp src/config/secrets.example.ts src/config/secrets.ts

# Edit the files and add your actual API keys
# src/config/apiKeys.ts - Add your Google Maps API key
# src/config/secrets.ts - Add any other sensitive keys
```

### 2. **For Production:**
- Use environment variables instead of hardcoded keys
- Set `GOOGLE_MAPS_API_KEY` in your production environment
- The `config.ts` file will automatically use environment variables in production

## Usage in Code

```typescript
// Import the configuration
import { GOOGLE_MAPS_API_KEY } from '../config/config';

// Use the API key
const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
```

## Security Best Practices

1. **Never commit real API keys to git**
2. **Use environment variables for production**
3. **Keep sensitive files in .gitignore**
4. **Use different keys for development and production**
5. **Regularly rotate your API keys**

## Environment Variables

For production, set these environment variables:
```bash
GOOGLE_MAPS_API_KEY=your-production-api-key
API_BASE_URL=https://your-production-api.com
```

## Troubleshooting

- If you get "API key not found" errors, make sure you've created `apiKeys.ts` from the example file
- For production issues, verify environment variables are set correctly
- Check that the correct config file is being imported
