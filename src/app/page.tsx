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
        className="bg-white text-zinc-900 antialiased pb-24"
        dangerouslySetInnerHTML={{ __html: finalSiteHtml }}
      />
      <Script src="/final-site.js" strategy="afterInteractive" />
    </>
  );
}
