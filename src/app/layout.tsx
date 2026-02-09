import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "WCFC Admin | E-commerce Dashboard",
  description: "Premium admin panel for WCFC e-commerce mobile app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--primary)',
                  secondary: 'var(--primary-foreground)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--destructive)',
                  secondary: 'var(--destructive-foreground)',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

