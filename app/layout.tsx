import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bone Mass Density",
  description: "Survey link for Bone Mass Density",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative overflow-y-hidden m-0 `}
      >
        {/* Background image for mobile */}
        <div className="absolute inset-0 md:hidden -z-10">
          <Image
            src="/images/sm-background.png"
            alt="Background"
            fill
            className=" object-center"
            priority
          />
        </div>

        {/* Background image for desktop */}
        <div className="absolute inset-0 hidden md:block -z-10">
          <Image
            src="/images/background.png"
            alt="Background"
            fill
            className=" object-center bg-center h-full"
            priority
          />
        </div>

        <Toaster />
        {children}
      </body>
    </html>
  );
}
