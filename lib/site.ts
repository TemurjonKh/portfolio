/** Public origin: NEXTAUTH_URL if set, else the Vercel production domain, else localhost. */
export const siteUrl = process.env.NEXTAUTH_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
