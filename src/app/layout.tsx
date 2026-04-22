import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Elevated Impact – Play. Win. Give Back.",
    template: "%s | Elevated Impact",
  },
  description:
    "The premium subscription platform where your athletic performance unlocks exclusive rewards and funds global social impact initiatives.",
  keywords: ["golf", "charity", "rewards", "impact", "subscription", "draw"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0F0A4A',
                color: '#fff',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: 'bold',
              },
            }}
          />
        </AuthProvider>

      </body>
    </html>
  );
}
