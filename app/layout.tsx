import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

// Шапка зависит от авторизации — не кэшировать, чтобы кнопка админки не мигала
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Namangan Elonlar - Namangan E'lonlari",
  description: "Namangan uchun e'lonlar platformasi. Sotib olish, sotish, xizmatlar va ijaraga olish.",
  keywords: "e'lonlar, namangan, sotib olish, sotish, xizmatlar, ijaraga olish",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

