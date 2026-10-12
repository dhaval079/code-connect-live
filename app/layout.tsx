import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodeConnect — Collaborate in Real-Time",
  description:
    "A real-time collaborative editor for developers who ship. Peer-to-peer syncing, shared cursors, and an AI that understands the whole room.",
  keywords: ["collaborative coding", "real-time editor", "pair programming", "WebRTC", "code together"],
  authors: [{ name: "Dhaval Rupapara", url: "https://github.com/dhaval079" }],
  openGraph: {
    title: "CodeConnect — Collaborate in Real-Time",
    description: "Join a room, share your code, and build amazing projects together.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen bg-paper font-sans antialiased">{children}</body>
    </html>
  );
}
