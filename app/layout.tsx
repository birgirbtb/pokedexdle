import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

const jostSans = Jost({
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokédexdle",
  description: "A daily Pokémon guessing game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jostSans.className} antialiased`}>{children}</body>
    </html>
  );
}
