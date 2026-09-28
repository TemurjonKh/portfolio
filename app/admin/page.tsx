import { requireAdmin } from "@/lib/auth";
import { getPortfolioContent } from "@/lib/content";
import { AdminDashboardV2 } from "@/components/AdminDashboardV2";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireAdmin();
  const content = await getPortfolioContent();
  return <AdminDashboardV2 initialContent={content} email={session.user.email} />;
}
