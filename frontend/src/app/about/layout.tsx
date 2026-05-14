import Navbar from "@/app/components/Navbar";
export const metadata = { title: "About – AI Vaidya" };
export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <><Navbar />{children}</>;
}
