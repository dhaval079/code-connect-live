import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { SocketProvider } from "@/providers/socketProvider";

// Load Google Fonts
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

// // Load Local Fonts
// const calSans = localFont({
//   src: [{ path: "/fonts/CalSans-SemiBold.woff2", weight: "600", style: "normal" }],
//   variable: "--font-cal",
// });

// const jetbrainsMono = localFont({
//   src: [
//     { path: "/fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
//     { path: "/fonts/JetBrainsMono-Bold.woff2", weight: "700", style: "normal" },
//   ],
//   variable: "--font-jetbrains",
// });

export const metadata: Metadata = {
  title: "Code Connect",
  description: "Real-time collaborative code editor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased">
        <ThemeProvider attribute="class">
          <SocketProvider>
            {children}
            <Toaster expand={false} position="top-center" richColors theme="dark" />
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
