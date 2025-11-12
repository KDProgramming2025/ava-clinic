## Running the code

Run `npm i` to install the dependencies.

For development, run `npm run dev` to start the Vite dev server.

## Backend service

The Express backend runs as a systemd service named `ava-beauty`.

- Restart: `systemctl restart ava-beauty`
- Check status: `systemctl status ava-beauty`

It serves the built frontend from the `build/` directory and exposes APIs under `/api/*` on port 4000 by default.

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

  