import type { Metadata, Viewport } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import "./globals.css";
import ToasterProvider from "@/components/providers/ToasterProvider";
import FCMInitializer from "@/components/providers/FCMInitializer";
import AuthProvider from "@/components/providers/AuthProvider";

const nanumMyeongjo = Nanum_Myeongjo({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "GrowTalk - 품격 있는 대화",
  description: "성장하는 사람들의 품격 있는 대화, GrowTalk",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GrowTalk",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${nanumMyeongjo.variable} font-sans antialiased bg-bg text-text-primary overflow-hidden`}
      >
        <div className="mx-auto max-w-[430px] h-[100dvh] bg-bg relative shadow-2xl overflow-hidden flex flex-col">
          <AuthProvider>
            <ToasterProvider />
            <FCMInitializer />
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
