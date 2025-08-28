import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

// Using system fonts as fallback due to Google Fonts connectivity issues
const inter = { className: "font-sans" }

export const metadata = {
  title: "Agrosphere ",
  description: "Comprehensive agriculture management platform for modern farming",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
