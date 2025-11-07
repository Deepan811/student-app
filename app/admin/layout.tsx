
'use client'

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip protection for auth pages
    if (pathname === '/admin' || pathname === '/admin/forgot-password') {
      return;
    }

    if (!isLoading) {
      // If user is not logged in or not an admin, redirect to admin login
      if (!user || user.role !== 'admin') {
        router.push('/admin');
      }
    }
  }, [user, isLoading, router, pathname]);

  // If it's an auth page, just render the children without any layout
  if (pathname === '/admin' || pathname === '/admin/forgot-password') {
    return <>{children}</>;
  }

  // Optionally, show a loading spinner or null while authentication is being checked
  if (isLoading || !user || user.role !== 'admin') {
    return null; // Or a loading spinner
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1fr_240px]">
      <main className="flex flex-1 flex-col p-4 lg:p-6 bg-gradient-to-br from-purple-600 to-blue-500">
        {children}
      </main>
      <AdminSidebar />
    </div>
  );
}