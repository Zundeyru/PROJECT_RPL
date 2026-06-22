import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AuthWrapper from "@/components/AuthWrapper";
import AppLayout from "@/components/AppLayout";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "E-Kantin UMM | Pembeli",
  description: "Aplikasi Kantin UMM untuk Pembeli",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${font.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background">
        <AuthWrapper>
          <CartProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </CartProvider>
        </AuthWrapper>
      </body>
    </html>
  );
}
