import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: "Gitivity - GitHub Profile Analytics & Scoring",
  description: "Analyze your GitHub profile with our multi-dimensional scoring system. Track your Creator, Collaborator, and Craftsmanship scores with achievements and leaderboards.",
  keywords: ["github", "profile", "analytics", "developer", "scoring", "contributions"],
  authors: [{ name: "Gitivity" }],
  openGraph: {
    title: "Gitivity - GitHub Profile Analytics & Scoring",
    description: "Analyze your GitHub profile with our multi-dimensional scoring system",
    type: "website",
    url: "https://gitivity.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gitivity - GitHub Profile Analytics & Scoring",
    description: "Analyze your GitHub profile with our multi-dimensional scoring system",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="//api.github.com" />
        <link rel="preconnect" href="https://api.github.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
