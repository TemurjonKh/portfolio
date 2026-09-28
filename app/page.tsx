import { getPortfolioContent } from "@/lib/content";
import { CosmosPortfolio } from "@/components/CosmosPortfolio";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getPortfolioContent({ publicView: true }).catch(() => null);
  return <CosmosPortfolio content={content} />;
}
