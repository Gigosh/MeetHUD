import type { Metadata } from "next";
import type { Viewport } from "next";
import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MeetHUD",
    template: "%s | MeetHUD",
  },
  description:
    "MeetHUD is a factory-warm meeting operating system for agenda flow, live notes, decision capture, and action follow-through.",
  applicationName: "MeetHUD",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MeetHUD",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--page)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}
