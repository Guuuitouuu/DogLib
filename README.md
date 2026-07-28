# DogLib

Marketplace et espaces pro pour **éducateurs canins** et **propriétaires** :
réservation, agenda, séances, suivi des chiens.

## Stack

- Next.js App Router (TypeScript)
- Tailwind + shadcn/ui
- Prisma + PostgreSQL (Supabase)
- Clerk (auth)
- Stripe Connect (prévu)

## Setup local

1. Copier l’environnement :

```bash
cp .env.example .env.local
```

2. Renseigner `DATABASE_URL`, les clés Clerk, et éventuellement `NEXT_PUBLIC_APP_URL`.

3. Installer et synchroniser le schéma :

```bash
npm install
npm run db:push
```

4. Lancer le serveur :

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Scripts utiles

| Script | Rôle |
|--------|------|
| `npm run build` | `prisma generate` + build prod |
| `npm run start` | Serveur prod local |
| `npm run lint` / `typecheck` | Qualité |
| `npm run check:db` | Ping Prisma |
| `npm run dev:clean` | Nettoie le cache `.next` |

## Déploiement (Vercel)

1. Importer le repo GitHub sur Vercel.
2. Variables d’environnement (Production + Preview) :
   - `DATABASE_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_APP_URL` = `https://votre-domaine`
   - Redirects Clerk vers `/auth/continue`
3. Webhook Clerk → `https://votre-domaine/api/webhooks/clerk` (events `user.created`, `user.updated`).
4. Après le premier deploy : `prisma db push` (ou migrations) contre la base prod.

Le build exécute `prisma generate` automatiquement (`postinstall` + script `build`).

## Structure

- `src/app/` — routes App Router
- `src/actions/` — Server Actions (Zod + Prisma)
- `src/lib/` — clients Prisma, helpers
- `src/components/` — UI métier + shadcn
