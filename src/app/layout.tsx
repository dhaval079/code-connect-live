// app/layout.tsx or app/layout.jsx
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { SocketProvider } from "@/providers/socketProvider"
import { ClerkProvider } from '@clerk/nextjs'
// Remove next/head if you're fully relying on metadata
// import Head from 'next/head'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'Code Connect - Real-time Collaborative Coding',
  description: 'Join a room, share your code, and build amazing projects together.',
  icons: [
    { rel: 'icon', url: '/main.svg', sizes: '48x48', type: 'image/png' },
  ],
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning={true}>
      <body className="antialiased">
        <ClerkProvider>
          <ThemeProvider attribute="class">
            <SocketProvider>
              {children}
              <Toaster expand={false} position="top-center" richColors theme="dark" />
            </SocketProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}