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
  "Scan it. Score it. Know what you're putting in your body. Gorilla Fuel is the no-BS supplement and food intelligence brand from the Gorilla Sports ecosystem.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gorillafuel.ca"),
  title: "Gorilla Fuel — Supplement & Food Intelligence",
  description,
  icons: {
    icon: "/gorilla-fuel-icon.png",
    apple: "/gorilla-fuel-icon.png",
  },
  openGraph: {
    title: "Gorilla Fuel — Supplement & Food Intelligence",
    description,
    images: [{ url: "/gorilla-fuel-icon.png", width: 1024, height: 1024, alt: "Gorilla Fuel" }],
  },
  twitter: {
    card: "summary",
    title: "Gorilla Fuel — Supplement & Food Intelligence",
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
