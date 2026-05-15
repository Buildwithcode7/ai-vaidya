import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
export const metadata = { title: "Search – AI Vaidya" };
export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <><Navbar /><ProtectedRoute>{children}</ProtectedRoute></>;
}
