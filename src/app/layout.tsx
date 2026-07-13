import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers, themeScript } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "PetChronicles — Daily Pet Game",
  description:
    "Accedi ogni giorno, fai evolvere il tuo pet e colleziona versioni infinite generate proceduralmente.",
};

export const viewport: Viewport = {
  themeColor: "#5A6FF9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
