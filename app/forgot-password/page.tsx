import { AuthShell } from "@/components/AuthShell";
import { ForgotPasswordForm } from "@/components/AuthForms";

export default function ForgotPasswordPage() {
  return <AuthShell eyebrow="Password recovery" title="Reset access." description="A one-time link will be sent if the email matches the owner account."><ForgotPasswordForm /></AuthShell>;
}
