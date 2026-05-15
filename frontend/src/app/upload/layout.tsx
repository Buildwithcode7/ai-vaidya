import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
export const metadata = { title: "Upload Documents – AI Vaidya" };
export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <><Navbar /><ProtectedRoute>{children}</ProtectedRoute></>;
}
