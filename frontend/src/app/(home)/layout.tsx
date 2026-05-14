import Navbar from "@/app/components/Navbar";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "AI Vaidya – Intelligent Ayurveda Q&A Assistant" };
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <><Navbar />{children}</>;
}
