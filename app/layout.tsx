import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: {
    default: "ReviewFlow AI — AI-Powered Google Reviews",
    template: "%s | ReviewFlow AI",
  },
  description:
    "Help your customers write authentic Google reviews in seconds. Scan a QR code, choose your experience, and let AI craft the perfect review.",
  keywords: [
    "google reviews",
    "AI reviews",
    "review generation",
    "QR code reviews",
    "restaurant reviews",
    "business reviews",
  ],
  authors: [{ name: "ReviewFlow AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ReviewFlow AI",
    title: "ReviewFlow AI — AI-Powered Google Reviews",
    description:
      "Help your customers write authentic Google reviews in seconds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReviewFlow AI",
    description:
      "Help your customers write authentic Google reviews in seconds.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f0f1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
