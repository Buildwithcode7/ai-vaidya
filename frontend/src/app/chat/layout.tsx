import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
export const metadata = { title: "Ask AI – AI Vaidya" };
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <><Navbar /><ProtectedRoute>{children}</ProtectedRoute></>;
}
