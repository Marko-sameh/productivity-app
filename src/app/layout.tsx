import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ImpactDialog } from "@/components/dashboard/impact-dialog";
import { Providers } from "@/components/providers";
import { Notifications } from "@/components/notifications";
import { Sidebar } from "@/components/sidebar";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Developer Performance Dashboard",
  description: "Personal metrics for salary review",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${plusJakarta.className} bg-background text-foreground flex h-screen overflow-hidden`}>
        <Providers>
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="m-5">
            {children}
            </div>
            <ImpactDialog />
            <Notifications />
          </main>
        </Providers>
      </body>
    </html>
  );
}
