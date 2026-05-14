import Navbar from "@/app/components/Navbar";
export const metadata = { title: "Upload Documents – AI Vaidya" };
export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <><Navbar />{children}</>;
}
