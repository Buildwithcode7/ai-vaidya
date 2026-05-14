import Navbar from "@/app/components/Navbar";
export const metadata = { title: "Knowledge Base – AI Vaidya" };
export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return <><Navbar />{children}</>;
}
