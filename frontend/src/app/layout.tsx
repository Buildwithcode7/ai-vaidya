import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Vaidya – Intelligent Ayurveda Q&A Assistant",
  description:
    "AI-powered Ayurvedic knowledge assistant. Upload classical texts and get grounded, citation-backed answers from the ancient wisdom of Ayurveda.",
  keywords: [
    "Ayurveda", "AI", "RAG", "knowledge base", "herbal medicine",
    "dosha", "vaidya", "natural healing",
  ],
  openGraph: {
    title: "AI Vaidya",
    description: "Intelligent Ayurveda Q&A Assistant powered by RAG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(15, 30, 25, 0.95)",
              color: "#e8f5e9",
              border: "1px solid rgba(104, 159, 56, 0.3)",
              borderRadius: "12px",
              backdropFilter: "blur(10px)",
              fontFamily: "var(--font-inter)",
            },
            success: { iconTheme: { primary: "#689f38", secondary: "#fff" } },
            error: { iconTheme: { primary: "#e57373", secondary: "#fff" } },
          }}
        />
        {children}
      </body>
    </html>
  );
}
