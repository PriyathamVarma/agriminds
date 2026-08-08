import Navbar from "@/shared/components/templates/navbar";
import Footer from "@/shared/components/templates/footer";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
