import Sidebar from "@/components/admin/Sidebar";
import { getAdminActuel } from "@/lib/auth";

export default async function AdminLayout({ children }) {
  const admin = await getAdminActuel();

  return (
    <div className="min-h-screen overflow-x-hidden bg-ong-fond">
      <Sidebar
        permissions={admin?.permissions ?? []}
        adminNom={admin?.nom ?? ""}
      />
      <main className="min-w-0 px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
