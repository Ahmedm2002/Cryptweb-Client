import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import {
  ProductHero,
  FeaturePillars,
  HowItWorks,
  Comparison,
} from "../components/marketing/ProductSections.jsx";
import {
  SecurityHighlight,
  Benefits,
  ProductCta,
} from "../components/marketing/ProductHighlights.jsx";
import { MarketingFooter } from "../components/marketing/MarketingFooter.jsx";

export const Product = () => {
  useDocumentTitle("Secure P2P File Transfer, Chat & Calls");
  return (
    <div className="relative min-h-screen bg-[#FAFBFD] flex flex-col text-gray-900 font-sans">
      <main className="relative z-10 flex-1">
        <ProductHero />
        <FeaturePillars />
        <HowItWorks />
        <Comparison />
        <SecurityHighlight />
        <Benefits />
        <ProductCta />
        <MarketingFooter />
      </main>
    </div>
  );
};
