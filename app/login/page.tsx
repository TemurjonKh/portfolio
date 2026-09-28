import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/AuthForms";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const { returnTo } = await searchParams;
  return <AuthShell eyebrow="Owner access" title="Welcome back." description="Sign in to edit the portfolio. There is no public account creation."><LoginForm returnTo={returnTo} /></AuthShell>;
}
