import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Libre_Franklin, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConsentBanner from "@/components/ConsentBanner";
import MobileAnchorAd from "@/components/MobileAnchorAd";
import { SITE } from "@/lib/site";
import { ADSENSE_CLIENT } from "@/lib/ads";

const franklin = Libre_Franklin({ subsets: ["latin"], variable: "--font-franklin", display: "swap", weight: ["400", "500", "600", "700"] });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", display: "swap", weight: ["600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `Home Improvement Cost Calculators by ZIP Code | ${SITE.name}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: { type: "website", siteName: SITE.name, url: SITE.url },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } } : {}),
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

// Consent Mode v2 defaults: denied in EEA/UK/CH until the visitor chooses, granted elsewhere.
const CONSENT_DEFAULTS = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','GB','CH'],wait_for_update:500});
gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="en-US" className={`${franklin.variable} ${serif.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS }} />
        <link rel="preconnect" href="https://images.unsplash.com" />
        {ADSENSE_CLIENT && <meta name="google-adsense-account" content={ADSENSE_CLIENT} />}
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <ConsentBanner />
        <MobileAnchorAd />
        {ADSENSE_CLIENT && (
          <Script id="adsense" strategy="lazyOnload" crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`} />
        )}
        {ga && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">{`gtag('js',new Date());gtag('config','${ga}');`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
