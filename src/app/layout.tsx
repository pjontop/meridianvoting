import type { Metadata } from "next";
import localFont from "next/font/local";
import { Space_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const circularStdBook = localFont({
  src: "../../public/fonts/CircularStdBook.woff2",
  variable: "--font-circular-std-book",
  display: "swap",
});

const circularStdMedium = localFont({
  src: "../../public/fonts/CircularStd-Medium.ttf",
  variable: "--font-circular-std-medium",
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Meridian - Peer Voting Platform",
  description: "A modern peer voting platform for project teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${circularStdBook.variable} ${circularStdMedium.variable} ${spaceMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}