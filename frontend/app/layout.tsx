import type { Metadata, Viewport } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: 'Verazoi | Predictive Metabolic Intelligence for CGM Users',
  description: 'Verazoi combines your CGM trends and lifestyle patterns to generate a personalized Stability Score and shows which small changes could improve it.',
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/verazoilogo.svg`,
  },
}

export const viewport: Viewport = {
  themeColor: '#f4f4f8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable} font-sans antialiased grain`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
