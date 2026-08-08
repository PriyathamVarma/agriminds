import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import Shell from "@/shared/components/mainTemplate";
import { Toaster } from "react-hot-toast";
import { SITE } from "@/shared/data/agriminds";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  metadataBase: new URL("https://agriminds.in"),
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <Shell>{children}</Shell>
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
