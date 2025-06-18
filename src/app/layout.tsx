import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Navigation } from "@/components/layout/navigation";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI Image Style Transfer - Gemini 2.0",
  description: "Transform your images with AI-powered artistic styles using Google's Gemini 2.0 Flash Preview. Upload, select a style, and get stunning results in seconds.",
  keywords: ["AI", "image", "style transfer", "Gemini", "artificial intelligence", "art"],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
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
        {/* Skip Links for Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <a 
          href="#navigation" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Skip to navigation
        </a>

        <QueryProvider>
          <div className="min-h-screen bg-background">
            {/* Header Navigation */}
            <header role="banner">
              <Navigation />
            </header>

            {/* Main Content */}
            <main 
              id="main-content" 
              role="main"
              className="focus:outline-none"
              tabIndex={-1}
            >
              {children}
            </main>

            {/* Footer */}
            <footer 
              role="contentinfo" 
              className="mt-auto border-t border-gray-200 bg-gray-50"
            >
              <div className="container mx-auto px-4 py-6">
                <div className="text-center text-sm text-gray-600">
                  <p>
                    © 2024 AI Image Style Transfer. Powered by{" "}
                    <a 
                      href="https://gemini.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    >
                      Google Gemini 2.0 Flash
                    </a>
                  </p>
                  <p className="mt-2">
                    <a 
                      href="#main-content" 
                      className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    >
                      Back to top
                    </a>
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
