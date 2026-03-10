# Environment

## Frontend

The frontend uses `VITE_API_URL`.

Files:

- `.env.development`
- `.env.production`
- `.env.example`

Examples:

- development: `VITE_API_URL=http://localhost:4000`
- production: `VITE_API_URL=https://api.example.com`

## Backend

Required production variables:

- `NODE_ENV=production`
- `PORT`
- `CLIENT_ORIGIN`
- `DATABASE_URL`
- `DIRECT_URL` if needed by Prisma
- `JWT_SECRET`
- `PAGESPEED_API_KEY`

## Recommended domain split

- frontend: `app.example.com`
- backend: `api.example.com`
