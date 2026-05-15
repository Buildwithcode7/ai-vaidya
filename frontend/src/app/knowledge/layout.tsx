import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
export const metadata = { title: "Knowledge Base – AI Vaidya" };
export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return <><Navbar /><ProtectedRoute>{children}</ProtectedRoute></>;
}
