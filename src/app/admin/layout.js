import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-ong-fond">
      <Sidebar />
      <main className="ml-64 p-6 lg:p-10">{children}</main>
    </div>
  );
}
