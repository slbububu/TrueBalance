import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrueBalance - See Your Real Spending",
  description: "TrueBalance is a free tool that calculates your true monthly and yearly spending by analyzing your expenses. Get a clear picture of where your money goes and make informed financial decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased" 
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
