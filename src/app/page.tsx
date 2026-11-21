import Script from "next/script";
import { finalSiteHtml } from "@/lib/final-site-html";

/**
 * Owner-approved final preview, mounted verbatim.
 * Styling lives in ./final-site.css and all interactions/3D live in
 * /public/final-site.js so the approved HTML and motion logic stay intact.
 */
export default function Home() {
  return (
    <>
      <div
        className="pb-24 antialiased selection:bg-red-600 selection:text-white"
        dangerouslySetInnerHTML={{ __html: finalSiteHtml }}
      />
      <Script src="/final-site.js" strategy="afterInteractive" />
    </>
  );
}
