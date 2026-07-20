import { Helmet } from "react-helmet-async";

export const Seo = ({ title, description }) => (
  <Helmet>
    <title>{title ? `${title} — Cryptweb` : "Cryptweb — Direct Secure File Transfers"}</title>
    {description && <meta name="description" content={description} />}
  </Helmet>
);
