import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import Navigation from "./components/Navigation";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gorilla Fuel — Supplement & Food Intelligence",
  description:
    "Scan it. Score it. Know what you're putting in your body. Gorilla Fuel is the no-BS supplement and food intelligence brand from the Gorilla Sports ecosystem.",
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
      </body>
    </html>
  );
}
