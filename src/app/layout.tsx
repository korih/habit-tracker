import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Track your habits and build streaks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
