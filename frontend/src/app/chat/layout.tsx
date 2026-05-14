import Navbar from "@/app/components/Navbar";
export const metadata = { title: "Ask AI – AI Vaidya" };
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <><Navbar />{children}</>;
}
