import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./lib/auth";
import { ToastProvider } from "./components/Toast";

export const metadata: Metadata = {
  title: "UFC Project Tracker",
  description: "The definitive hub for all club projects. Build, ship, and showcase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ConvexClientProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <main className="main-content">{children}</main>
            </ToastProvider>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
