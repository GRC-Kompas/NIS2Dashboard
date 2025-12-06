import { Sidebar } from '@/components/Sidebar';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={session?.role} organisationId={session?.organisationId} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
         {/* Top bar could be here if needed globally, but user asked for "Main content area with a top bar"
             which often implies per-page header. However, we can put a generic placeholder or breadcrumb container here if desired.
             Let's keep it clean and let pages define their headers or put a generic user bar here.
         */}
         <main className="flex-1 overflow-y-auto focus:outline-none p-8">
            {children}
         </main>
      </div>
    </div>
  );
}
