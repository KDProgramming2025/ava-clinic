## Running the code

Run `npm i` to install the dependencies.

For development, run `npm run dev` to start the Vite dev server.

## Backend service

The Express backend runs as a systemd service named `ava-beauty`.

- Restart: `systemctl restart ava-beauty`
- Check status: `systemctl status ava-beauty`

It serves the built frontend from the `build/` directory and exposes APIs under `/api/*` on port 4000 by default.

### Enabling the service (required for Instagram APIs)

1. Copy the provided unit file: `sudo cp server/ava-beauty.service /etc/systemd/system/ava-beauty.service`.
2. Ensure `.env` defines `DATABASE_URL`, `JWT_SECRET`, **and** the Instagram vars (`INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_REDIRECT_URI`).
3. Reload systemd & start: `sudo systemctl daemon-reload && sudo systemctl enable --now ava-beauty`.
4. Verify the API locally before exposing it: `curl http://127.0.0.1:4000/api/instagram/status` should return JSON instead of 404.

If the curl check fails, the frontend will also receive 404s for `/api/instagram/*`, so resolve backend issues before redeploying static assets.

### Reverse proxy (Nginx)

Use `server/nginx.conf.example` as a starting point. Key requirements:

- `location /api/` must `proxy_pass http://127.0.0.1:4000/;` so Express handles every `/api/*` request.
- `root /var/www/ava-beauty/build;` should serve the Vite build artifacts.
- Reload Nginx after editing: `sudo nginx -t && sudo systemctl reload nginx`.

Without the proxy block the browser will hit the static server directly and receive `404 Not Found` for `/api/instagram/status` and `/api/instagram/feed`.

## Database and Prisma

This project uses PostgreSQL with Prisma. The database URL is configured via the `.env` file (see `DATABASE_URL`).

- Apply migrations: `npx prisma migrate deploy` (CI/production)
- Create/apply a new migration from schema changes: `npx prisma migrate dev --name <change>` (local)

Recent additions:

- Home hero image: field `HomeHero.imageUrl`
- About mission images: fields `AboutMission.imageHeroUrl`, `AboutMission.imageSecondaryUrl`

## Admin: managing hero images

You can set homepage and about page hero images from the admin dashboard:

- Home > Content Management: update the “Hero Image URL” under the Hero section.
- About > Content Management: update the “Hero Image URL” and “Secondary Image URL” under Mission.

Click “Save Changes” to persist. The public pages will pick up these values immediately.

## Build frontend

To build the frontend for production and populate the `build/` folder:

```
npm run build
```

After building, restart the backend service if needed to refresh static assets.

  
## Admin & Authentication

Admin users authenticate via POST `/api/auth/login` with email and password. Passwords are stored as bcrypt hashes (bcryptjs, cost 12). A JWT is returned and used in the admin UI.

### First-time setup (seed a SUPERADMIN)

There is no default account. Seed the first SUPERADMIN using env vars and the seed script:

1. Temporarily set `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` in `.env` or systemd unit.
2. Run `npm run seed:superadmin`.
3. Remove the temporary env vars after creation.

Script location: `server/scripts/seedSuperAdmin.js` (reads env vars, idempotent).

### Managing admin users

Admin panel > Access Control (requires ADMIN or SUPERADMIN) lets you create, edit, deactivate, delete, and reset passwords.

API endpoints (ADMIN/SUPERADMIN only):
- `GET /api/admin-users` (now protected)
- `POST /api/admin-users` create `{ email, password, name?, role? }`
- `PUT /api/admin-users/:id` update `{ name?, role?, active?, password? }`
- `DELETE /api/admin-users/:id` remove user

### Security settings

- Set a strong `JWT_SECRET` (fallback dev string is insecure).
- Login rate limiting env vars:
	- `RL_WINDOW_MS` (default 900000 = 15m)
	- `RL_MAX` (default 20 attempts per IP per window)
- Enforce HTTPS at reverse proxy.
- Consider adding audit logging & password policy later.

## Systemd Service Notes

Unit file: `server/ava-beauty.service`. Added recommended env vars:

```
Environment=JWT_SECRET=change_me_in_production
Environment=RL_WINDOW_MS=900000
Environment=RL_MAX=20
# Media/CDN base (ensures uploads resolve to public domain)
Environment=MEDIA_BASE_URL=https://ava-beauty.com

# Optional one-time seed vars (remove after running seed script):
# Environment=SUPERADMIN_EMAIL=admin@example.com
# Environment=SUPERADMIN_PASSWORD=StrongInitialPassword123!

# Frontend builds also read `VITE_MEDIA_BASE_URL` (set in `.env` with the same value) so static assets reference the public domain instead of the server IP.
```

Reload and restart after edits:

```
sudo systemctl daemon-reload
sudo systemctl restart ava-beauty
```

