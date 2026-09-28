import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuickKart | Customer Churn Predictor",
  description: "Predict e-commerce customer churn and get retention recommendations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
