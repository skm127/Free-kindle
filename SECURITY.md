# Security Policy

## Reporting Vulnerabilities
If you discover a security vulnerability within this project, please report it via the issue tracker or email the maintainers directly. Do not disclose the vulnerability publicly until it has been resolved.

## Content Policy
This application provides access to public domain books and user-owned content. Users are responsible for ensuring they have the right to access and read the imported materials.

## Security Practices
- **Environment Variables**: Sensitive configuration such as Firebase API keys are managed via environment variables.
- **Client-Side Limitations**: No server secret keys or administrative credentials should be included in the client-side code. Only public-facing client configuration is stored in environment variables intended for the browser (e.g., `VITE_FIREBASE_*`).
