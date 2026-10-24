"use client";
import Script from "next/script";
import { GADS_ID } from "@/lib/gtag";

/**
 * Loads the Google Ads global site tag (gtag.js) for conversion tracking.
 * Rendered once, site-wide, from the root layout.
 */
export default function GoogleAdsTag() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GADS_ID}');`}
      </Script>
    </>
  );
}
