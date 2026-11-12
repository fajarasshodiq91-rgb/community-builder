import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Community Builder",
  description: "Design and build your creator community infrastructure.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
