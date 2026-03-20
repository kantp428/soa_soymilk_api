'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  List,
  PackageOpen,
  Truck,
  Tag,
  Users,
  Store,
  ArrowLeft,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin', label: 'ภาพรวมระบบ (Dashboard)', icon: LayoutDashboard },
  { href: '/admin/menu', label: 'จัดการเมนูและหมวดหมู่', icon: List },
  { href: '/admin/inventory', label: 'จัดการสต็อกสินค้า', icon: PackageOpen },
  { href: '/admin/purchases', label: 'ซัพพลายเออร์และจัดซื้อ', icon: Truck },
  { href: '/admin/promotions', label: 'โปรโมชั่นและส่วนลด', icon: Tag },
  { href: '/admin/staff', label: 'จัดการพนักงาน', icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-zinc-950 text-zinc-300 flex-shrink-0 flex flex-col h-screen overflow-hidden border-r border-zinc-800 shadow-2xl z-50">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800">
        <Store className="w-6 h-6 mr-3 text-white" />
        <span className="text-white font-semibold text-lg tracking-tight">ระบบหลังบ้าน</span>
      </div>

      <div className="px-4 py-4 border-b border-zinc-800 grid grid-cols-2 gap-2">
         <Link href="/pos" className="flex items-center justify-center p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-white transition-colors border border-zinc-800">
            <ArrowLeft className="w-3 h-3 mr-1" /> หน้าร้าน
         </Link>
         <Link href="/" className="flex items-center justify-center p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-white transition-colors border border-zinc-800">
            <Home className="w-3 h-3 mr-1" /> หน้าหลัก
         </Link>
      </div>

      <nav className="flex-1 py-6 px-4 overflow-y-auto">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl text-sm transition-all duration-200 group",
                    isActive
                      ? "bg-white text-zinc-950 font-bold shadow-lg"
                      : "hover:bg-zinc-800/50 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 mr-3 transition-transform group-hover:scale-110", isActive ? "text-zinc-950" : "text-zinc-500")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500">
        POS System v1.0
      </div>
    </aside>
  );
}
