import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import {
  SecurityHero,
  HowFilesStayPrivate,
  NoStorage,
} from "../components/marketing/SecuritySections.jsx";
import {
  AfterTransfer,
  SecurityFaq,
  SecurityCta,
} from "../components/marketing/SecurityFaq.jsx";
import { MarketingFooter } from "../components/marketing/MarketingFooter.jsx";

export const Security = () => {
  useDocumentTitle("Security");
  return (
    <div className="relative min-h-screen bg-[#FAFBFD] flex flex-col text-gray-900">
      <main className="relative z-10 flex-1">
        <SecurityHero />
        <HowFilesStayPrivate />
        <NoStorage />
        <AfterTransfer />
        <SecurityFaq />
        <SecurityCta />
      </main>

      <MarketingFooter />
    </div>
  );
};
