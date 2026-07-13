import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fashion Dress Mart | Sri Lanka's Premier Fashion Destination",
  description: "Discover elegant sarees, stylish dresses, kurta sets, blouses, and lehengas at Fashion Dress Mart. Sri Lanka's finest collection of traditional and modern fashion.",
  keywords: ["Sri Lanka", "fashion", "sarees", "dresses", "kurtas", "lehengas", "online shopping", "Colombo"],
  authors: [{ name: "Fashion Dress Mart" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Fashion Dress Mart - Sri Lanka's Premier Fashion Destination",
    description: "Discover elegant sarees, stylish dresses, and traditional attire. Quality fabrics and timeless designs.",
    siteName: "Fashion Dress Mart",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}