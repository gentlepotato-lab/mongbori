# MongBori Climb

A pixel-art vertical climber game starring a yellow parrot scaling a balcony curtain rope. Includes login, difficulty modes, and run ?? ?? in PostgreSQL.

## Stack
- Web: Vite + TypeScript + Phaser
- API: Node.js + TypeScript + Express
- DB: PostgreSQL (schema: mongbori)

## Structure
- apps/web: frontend
- apps/server: backend API

## Dev Setup
1. Create env files

apps/server/.env
`
PORT=4080
DB_HOST=host.docker.internal
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET=change_this_secret
CORS_ORIGIN=http://localhost:5174
DB_INIT=1
`

apps/web/.env
`
VITE_API_BASE=http://localhost:4080
`

2. Install deps
`
cd apps/server
npm install
cd ..\web
npm install
`

3. Initialize DB tables (only once)
`
cd apps/server
npm run db:init
`

4. Run dev
`
# terminal 1
cd apps/server
npm run dev

# terminal 2
cd apps/web
npm run dev
`

## Production
- Build API and web separately.
- Use environment variables for prod, never commit .env.

apps/server/.env.production (example)
`
PORT=4080
DB_HOST=host.docker.internal
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET=replace_in_prod
CORS_ORIGIN=https://your-domain
DB_INIT=0
`

apps/web/.env.production
`
VITE_API_BASE=https://your-api-domain
`

Build commands:
`
cd apps/server
npm run build
npm run start

cd ..\web
npm run build
`

## Notes
- The DB schema uses mongbori and creates tables under that schema.
- JWT auth is required for saving runs and reading leaderboards.