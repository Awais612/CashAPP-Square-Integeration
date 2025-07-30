// app/layout.tsx
import "./globals.css";
import Script from "next/script";
import type { Metadata } from "next";

// ✅ Define metadata
export const metadata: Metadata = {
  title: {
    default: "Ultra Solution Services | Square Cash App Pay",
    template: "%s | Ultra Solution Services",
  },
  description: "Best checkout experience using Square Cash App Pay.",
};

// const isProd = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "production";
// const squareSdkUrl = isProd
//   ? "https://web.squarecdn.com/v1/square.js"
//   : "https://sandbox.web.squarecdn.com/v1/square.js";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ Script still works here without "use client" */}
        <Script
          src="https://web.squarecdn.com/v1/square.js"
          strategy="lazyOnload"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
