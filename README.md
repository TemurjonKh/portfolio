# Temurjon Kholmirzaev — portfolio and owner CMS

A Next.js App Router portfolio with a database-backed public site, a single-owner admin dashboard, credentials authentication, password recovery, image/PDF uploads, and live content editing.

## Deploy to Vercel (about 10 minutes)

1. Push this folder to a new GitHub repo. `package.json` must be at the repo root, not inside a subfolder.
2. On vercel.com: **Add New → Project**, import the repo. The framework should show **Next.js**. Leave Root Directory empty.
3. Before the first deploy, open the project's **Storage** tab and create:
   - **Neon (Postgres)**. This sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
   - **Blob**. This sets `BLOB_READ_WRITE_TOKEN` so uploads survive redeploys.
4. **Settings → Environment Variables**, add:
   - `ADMIN_INITIAL_PASSWORD`: 12+ characters. Creates your admin account on the first deploy.
   - `NEXTAUTH_URL`: your public address, e.g. `https://yourdomain.com` (optional; defaults to the Vercel domain).
   - `EMAIL_PROVIDER_API_KEY` and `EMAIL_FROM` (Resend) to turn on the contact form and password reset.
5. Deploy. The `vercel-build` script creates the tables, fills in the starter content (only when empty), and builds the site.
6. Custom domain: **Settings → Domains → Add**, then copy the DNS records Vercel shows into DNSimple until the domain shows *Valid Configuration*.

After the first successful deploy you can remove `ADMIN_INITIAL_PASSWORD`; it is never used again once the account exists.

## Local setup

1. Install Node.js 20 or newer and run `npm install`.
2. Copy `.env.example` to `.env`. Paste your Neon connection string into both `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
3. Run `npm run db:push`, then `npm run db:seed`.
4. Run `npm run dev` and open `http://localhost:3000`. Uploads are saved to `public/uploads` when `BLOB_READ_WRITE_TOKEN` is empty.

The owner signs in at `/login` with `kholmirzaevtemurjon@gmail.com`. There is intentionally no sign-up or second-user flow.

## Updating an existing database (Sep 2026 redesign)

The redesign adds a resume link, Kaggle link, project tracks, teaser visibility, project results, and skill groups.

1. `npm run db:push` adds the new columns and the `SkillGroup` table without deleting data.
2. `npm run content:update` rewrites project copy, adds Smart Hospital and Uninvited, and creates skill groups. Uploaded images are kept, and it is safe to run more than once. The copy lives in `prisma/portfolio-content.ts`.
3. In `/admin`, open Profile and upload your resume PDF. The Resume buttons appear only once it is set.

`content:update` also fills in the bundled portrait (`/media/profile.jpg`), project screenshots, and the two volunteer entries with their photos, but only where those are still empty. Anything you already uploaded is left alone.

### Project types
Each project has a **Type**: Games, AI & agents, Sensing & hardware, or Systems & data. The Work section shows a filterable grid (the first project gets the wide card, so order matters), and clicking a card opens the full project in a dialog. The same types are the constellations on the hero star chart. Change a project's type in `/admin` under Projects.

### Project visibility
- **Public** shows everything.
- **Teaser** shows only the title, status, teaser line, and media. Description, tools, results, and links are removed on the server (`lib/content.ts`), so they never reach the page source.

### Project media
Upload images or MP4/WebM videos, or paste a YouTube link. Projects without media show no media area. On Vercel, prefer YouTube links for video, because serverless request bodies are size-limited.

## Email setup

Password recovery and the public contact form use the Resend HTTP API. Contact messages go to the owner address with the sender as reply-to. The form allows 3 messages per hour per IP and has a hidden spam field. Create a Resend API key, verify the sending domain/address, and set `EMAIL_PROVIDER_API_KEY` and `EMAIL_FROM`. `NEXTAUTH_URL` must be the public site origin so reset links point to the correct deployment. The reset response is deliberately generic for every submitted email.

## Upload storage

`lib/storage.ts` writes to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, and to `public/uploads` otherwise (local development only).

## Security notes

- Passwords use bcrypt-compatible hashing with a cost factor of 12.
- Sessions are random opaque tokens; only SHA-256 hashes are stored. Resetting a password invalidates every active session.
- Reset tokens are random, hashed in the database, expire after one hour, and are single-use.
- Login and forgot-password endpoints use database-backed IP/time-window throttles.
- Middleware blocks anonymous admin routes, and every admin route also verifies the database session server-side.
- All admin payloads and uploads are validated on the server.
