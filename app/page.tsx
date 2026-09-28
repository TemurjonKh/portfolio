import { CosmosPortfolio } from "@/components/CosmosPortfolio";
import { portfolioContent } from "@/lib/content";

export default function HomePage() {
  return <CosmosPortfolio content={portfolioContent} />;
}
