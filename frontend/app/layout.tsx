import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChatSessionProvider } from "@/components/chat/session";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "DocuFlow",
  description: "AI knowledge base and chat workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-background text-foreground`}>
        <ChatSessionProvider>{children}</ChatSessionProvider>
      </body>
    </html>
  );
}