import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IntroSort — Algorithm Visualization",
  description:
    "Interactive visualization of the IntroSort algorithm — watch QuickSort, HeapSort, and Insertion Sort work together in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={`${geistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
