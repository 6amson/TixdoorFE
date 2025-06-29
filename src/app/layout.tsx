import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import "./globals.scss";
// import { Inter } from 'next/font/google';
import Header from "./components/Header/header";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Tixdoor",
  description: "Customer support simplified",
  metadataBase: new URL("https://tixdoor.vercel.app"),
};


// const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <Toaster position="top-center" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
