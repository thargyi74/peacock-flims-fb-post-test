import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Facebook Page Posts | Peacock Film Festival",
  description: "View the latest posts and updates from DVB Peacock Film Festival Facebook page",
  keywords: ["Facebook", "posts", "DVB Peacock Film Festival", "entertainment", "social media"],
  authors: [{ name: "DVB Peacock Film Festival" }],
  openGraph: {
    title: "Facebook Page Posts | Peacock Film Festival",
    description: "View the latest posts and updates from DVB Peacock Film Festival",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Facebook Page Posts | Peacock Film Festival",
    description: "View the latest posts and updates from DVB Peacock Film Festival",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
