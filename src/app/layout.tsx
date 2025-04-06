import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--poppins-font",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal"],
});

export const metadata: Metadata = {
  title: "SOD Diagram PT Menara Terus Makmur",
  description: "Delivery & Finishing Good",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-[family-name:var(--poppins-font)] antialiased min-h-screen flex flex-col`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
