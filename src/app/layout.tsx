import "./globals.css";
import Script from "next/script";
import TopNav from "./components/TopNav";
import TriPChatWidget from "./components/TriPChatWidget";
import PublicFooter from "./components/PublicFooter";

export const metadata = {
  title: "TRI-P Tech Limited",
  description: "TRI-P Tech Limited develops and builds solar, security, and product design systems",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/images/logo/Logo C.png",
  },
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TSLHFMKZKK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TSLHFMKZKK');
          `}
        </Script>
        <TopNav />
        {children}
        <PublicFooter />
        <TriPChatWidget />
      </body>
    </html>
  );
}
