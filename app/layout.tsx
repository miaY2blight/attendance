import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "勤怠管理システム",
  description: "社員の出退勤・休憩の打刻と申請を管理するシステム",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=Roboto+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">{children}</body>
    </html>
  );
}
