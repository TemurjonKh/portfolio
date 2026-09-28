import { AuthShell } from "@/components/AuthShell";
import { ResetPasswordForm } from "@/components/AuthForms";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <AuthShell eyebrow="Secure reset" title="Choose a new password." description="This link is single-use and expires one hour after it was requested.">{token ? <ResetPasswordForm token={token} /> : <p className="border hairline bg-white p-4 text-sm">This reset link is incomplete. Request a new one from the forgot-password page.</p>}</AuthShell>;
}
