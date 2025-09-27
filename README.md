# Chat Backend (Node.js + TypeScript)

## Quickstart
```bash
docker compose up -d
cp .env.example .env
npm i
npx prisma migrate dev --name init && npx prisma generate
npm run dev         # API
npm run dev:worker  # Summary worker (optional)
```

### Smoke test
- `POST /api/auth/register` → `{email, password}`
- `POST /api/auth/login` → returns access/refresh
- `POST /api/rooms` (Bearer access) → create room
- `POST /api/messages/room/:roomId` → create message
- `GET /api/messages/:id/translate?locale=ja` → machine translation (needs OPENAI_API_KEY)
