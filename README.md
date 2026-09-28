# Temurjon Kholmirzaev — portfolio

A static Next.js site. No database, no login.

## Edit content
All text lives in two files:
- `lib/portfolio-data.ts`: projects, skills, volunteer entries, awards
- `lib/content.ts`: profile, education, certificates, languages, interests

Images go in `public/media/` and are referenced as `/media/name.jpg`.
To show the Resume buttons, add `public/resume.pdf` and set `resumeUrl: "/resume.pdf"` in `lib/content.ts`.

## Run locally
```
npm install
npm run dev
```
Open http://localhost:3000.

## Deploy
Push to GitHub. Vercel builds it with `npm run build`. No environment variables are needed.
