// "use client";
// import type { Metadata } from "next";
import "./globals.css";
import TopNav from "./components/TopNav";
import { usePathname } from "next/navigation";
import { title } from "process";
import { describe } from "node:test";

export const metadata = {
  title: "TRI-P Innovations",
  describe: "TRI-P Innovation develops and build solar and security systems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // console.log("current page: " + currentPath);
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
