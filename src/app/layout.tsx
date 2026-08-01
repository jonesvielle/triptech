import "./globals.css";
import TopNav from "./components/TopNav";
import TriPChatWidget from "./components/TriPChatWidget";
import PublicFooter from "./components/PublicFooter";

export const metadata = {
  title: "TRI-P Tech Limited",
  description: "TRI-P Tech Limited develops and builds solar, security, and product design systems",
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
        <PublicFooter />
        <TriPChatWidget />
      </body>
    </html>
  );
}
