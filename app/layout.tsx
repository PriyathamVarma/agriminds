import type { Metadata } from "next";
import { Ubuntu, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SITE } from "@/shared/data/agriminds";
import { JsonLd, ORGANIZATION_JSON_LD, WEBSITE_JSON_LD } from "@/shared/components/seo/jsonLd";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: `${SITE.description} Discover agripreneurship in Vizag and connect with agripreneurs in Vizag through the AgriMinds ecosystem.`,
  keywords: ["agripreneurship in Vizag", "agripreneurs in Vizag", "agriculture entrepreneurship in Visakhapatnam", "agri startup ecosystem Vizag"],
  metadataBase: new URL("https://agriminds.org"),
  alternates: { canonical: "/" },
  applicationName: SITE.name,
  verification: { google: "BPLak2nrygxbpPmuhJu0sANOKrZEjU-4RzNYBvhdXR8" },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: `${SITE.description} Discover agripreneurship in Vizag and connect with agripreneurs in Vizag through the AgriMinds ecosystem.`,
    type: "website",
    url: "https://agriminds.org/",
    siteName: SITE.name,
    images: [{ url: "/brand/images/hero-banner.webp", width: 1600, height: 900, alt: "AgriMinds — From Farm to Enterprise" }],
  },
  twitter: { card: "summary_large_image", title: `${SITE.name} — ${SITE.tagline}`, description: SITE.description, images: ["/brand/images/hero-banner.webp"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${ubuntu.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <JsonLd data={ORGANIZATION_JSON_LD} />
        <JsonLd data={WEBSITE_JSON_LD} />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fffdf8",
              color: "#14201a",
              border: "1px solid #e2dac5",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#1f4d3a", secondary: "#fff" } },
            error: { iconTheme: { primary: "#b3401f", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
