import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { SocketProvider } from "@/providers/socketProvider"
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <ClerkProvider
          appearance={{
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "blockButton",
            },
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
              card: 'bg-transparent border-none shadow-none',
              formField: 'gap-1',
              formFieldInput: 'bg-gray-800 border-gray-700',
              footerActionLink: 'text-blue-400 hover:text-blue-300',
              dividerLine: 'bg-gray-700',
              dividerText: 'text-gray-400',
            }
          }}
        >
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