import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-ong-fond">
      <Sidebar />
      <main className="min-w-0 px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
