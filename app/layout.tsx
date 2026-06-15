/**
 * DO NOT ADD MANUAL <head> ELEMENTS HERE — causes a hydration crash and
 * breaks ALL client-side navigation site-wide (every link appears to "return
 * to the homepage"). Next.js manages <head> itself in the App Router. Put
 * scripts in <body> using next/script with strategy="afterInteractive".
 * Root cause history: commit 627f7b9.
 */
import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import Navigation from "./components/Navigation";
import SiteFooter from "./components/SiteFooter";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const description =
  "Canada's free barcode scanner for food, beer, wine and supplements. Scan any product and get an instant no-BS score out of 100. No ads. No sponsors. Just data.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gorillafuel.ca"),
  title: "Gorilla Fuel — Scan It. Score It. Know It.",
  description,
  icons: {
    icon: "/gorilla-fuel-icon.png",
    apple: "/gorilla-fuel-icon.png",
  },
  openGraph: {
    title: "Gorilla Fuel — Scan It. Score It. Know It.",
    description,
    images: [{ url: "/gorilla-fuel-icon.png", width: 1024, height: 1024, alt: "Gorilla Fuel" }],
  },
  twitter: {
    card: "summary",
    title: "Gorilla Fuel — Scan It. Score It. Know It.",
    description,
    images: ["/gorilla-fuel-icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        <Navigation />
        <div className="flex-1 flex flex-col">{children}</div>
        <SiteFooter />
        <Analytics />
        <Script strategy="afterInteractive" id="sw-register">
          {`if('serviceWorker' in navigator){
  var hadController = !!navigator.serviceWorker.controller, refreshing = false;
  // A new worker taking control means an update activated (skipWaiting +
  // clients.claim). Reload ONCE to pick it up — but only if a worker was
  // already controlling this page (a genuine update), never on first install,
  // and guarded so it can't loop.
  navigator.serviceWorker.addEventListener('controllerchange', function(){
    if (refreshing) return;
    refreshing = true;
    if (hadController) window.location.reload();
  });
  // updateViaCache:'none' forces the browser to always revalidate sw.js itself
  // (not serve it from HTTP cache), so new deploys are detected reliably.
  navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).then(function(reg){
    reg.update();
    // iOS standalone PWAs relaunch from background without a full reload —
    // check for a new worker every time the app returns to the foreground.
    document.addEventListener('visibilitychange', function(){
      if (document.visibilityState === 'visible') reg.update();
    });
  }).catch(function(){});
}`}
        </Script>
        {GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script strategy="afterInteractive" id="ga-init">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
