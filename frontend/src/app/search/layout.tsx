import Navbar from "@/app/components/Navbar";
export const metadata = { title: "Search – AI Vaidya" };
export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <><Navbar />{children}</>;
}
