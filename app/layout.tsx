import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { RoleProvider } from "@/lib/context/role-context"
import { HelpModeProvider } from "@/lib/context/help-mode-context"
import { Toaster } from "sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PrintERP - Ishlab Chiqarish Boshqaruvi Tizimi",
  description: "Chop va quti ishlab chiqarish uchun to'liq ERP va CRM tizimi",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon.ico",
      },

    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz" className="dark h-full" suppressHydrationWarning>
      <body className="font-sans antialiased bg-slate-950 text-slate-50 h-full overflow-hidden" suppressHydrationWarning>
        <RoleProvider>
          <Toaster richColors position="top-right" />
          {children}
        </RoleProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
