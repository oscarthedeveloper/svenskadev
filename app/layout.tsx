import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AdminProvider from "@/components/admin/AdminContext";
import AdminBar from "@/components/admin/AdminBar";
import { getAdminSession } from "@/lib/session";
const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono", display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://svenska.dev"),
  title: { default: "svenska.dev — med ordet i centrum", template: "%s · svenska.dev" },
  description: "Språkråd, svensk grammatik och genomtänkta ordval. Ett levande arkiv för dig som vill skriva tydligare och förstå mer.",
  openGraph: { title: "svenska.dev — med ordet i centrum", description: "Språkets små knutar, användbara ord och oväntade sidospår.", locale: "sv_SE", type: "website" },
  twitter: { card: "summary", title: "svenska.dev — med ordet i centrum" },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, username } = await getAdminSession();
  return <html lang="sv" className={`${display.variable} ${mono.variable}`}><body><a className="skip-link" href="#main-content">Hoppa till innehåll</a><AdminProvider isAdmin={isAdmin}><div id="main-content">{children}</div><AdminBar username={username} /></AdminProvider></body></html>;
}
