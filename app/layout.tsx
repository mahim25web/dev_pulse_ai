import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Noto_Sans_Bengali, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const ui = Schibsted_Grotesk({ variable: "--font-ui", subsets: ["latin"] });
const bengali = Noto_Sans_Bengali({ variable: "--font-bn", subsets: ["bengali"] });
const code = JetBrains_Mono({ variable: "--font-code", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevPulse AI",
  description: "Fix bugs, generate UI, summarise articles, and translate. Powered by Gemini.",
};

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ui.variable} ${bengali.variable} ${code.variable}`}>
      <body>{children}</body>
    </html>
  );
}
