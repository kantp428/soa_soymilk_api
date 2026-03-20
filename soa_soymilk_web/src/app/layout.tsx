import type { Metadata } from "next";
import { Anuphan, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Anuphan({
  subsets: ["thai", "latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

import Providers from "./providers";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "ร้านน้ำเต้าหู้ ตั้งหวังเจ๊ง",
  description: "POS and Inventory Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
