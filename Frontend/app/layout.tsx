import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./carecircle.css";
import { cn } from "@/lib/utils";
import { RouteTransition } from "@/components/motion/route-transition";
import { Toaster } from "sonner";
import RealtimeSimulatorDriver from "@/lib/realtime/RealtimeSimulatorDriver";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareCircle | Smart Healthcare Powered by AI",
  description: "A futuristic AI-powered smart hospital management system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, "dark")}
    >
      <body className="min-h-full flex flex-col carecircle-theme overflow-x-hidden">
        <RouteTransition>
          <RealtimeSimulatorDriver />
          <div className="min-w-0 w-full">{children}</div>
        </RouteTransition>
        <Toaster richColors position="top-right" />

      </body>

    </html>
  );
}
