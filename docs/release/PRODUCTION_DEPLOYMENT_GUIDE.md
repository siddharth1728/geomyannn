# GEORYNTH — PRODUCTION DEPLOYMENT GUIDE (WEBSITE)

This guide covers deploying the GEORYNTH website to Vercel, Netlify, or any standard Node.js hosting platform.

---

## 1. Quick Deploy on Vercel

GEORYNTH is built natively on **Next.js 15 App Router** and deploys seamlessly to Vercel.

### Prerequisites
1. A GitHub repository containing the GEORYNTH codebase.
2. A free or paid Vercel account.

### Deployment Steps
1. Navigate to [vercel.com/new](https://vercel.com/new).
2. Import the `geomyannn` repository.
3. Configure the **Build & Development Settings**:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
4. Add the following **Environment Variables** in the Vercel dashboard:

| Variable Name | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_MAPTILER_KEY` | **Yes** | Client-side MapTiler API key for vector map tiles | `YOUR_MAPTILER_KEY` |
| `GRAPHHOPPER_API_KEY` | **Yes** | Server-side routing & matrix calculation key | `YOUR_GRAPHHOPPER_KEY` |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional | Supabase public anonymous key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase service key for admin backend operations | `eyJhbGciOi...` |

5. Click **Deploy**. Vercel will build the project and output a live production URL (e.g. `https://georynth.vercel.app`).

---

## 2. Docker / Self-Hosted Node.js Deployment

If self-hosting using Docker or Ubuntu server:

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 3. Database Migration (Supabase)

To enable permanent PostgreSQL storage rather than the in-memory fallback:

```bash
# Install Supabase CLI
npm install -g supabase

# Link your Supabase project
supabase link --project-ref ppytdnhvvbmhaaurydza

# Apply migrations
supabase db push
```

---

## 4. Post-Deployment Verification Checklist

- [ ] Open home page: Vector map renders without missing tile errors.
- [ ] Check `/api/status`: Returns JSON with `maptilerConfigured: true` and `graphhopperConfigured: true`.
- [ ] Test 1-Click Hyderabad Demo: Matrix calculates driving durations for all 4 friends.
- [ ] Create a new Meetup: Ensure invite code is generated and shareable on WhatsApp.
- [ ] Test Search: Search for a landmark (e.g., "Charminar") and verify map pans to it.
