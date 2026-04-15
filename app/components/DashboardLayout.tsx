"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react"; // Using this as a placeholder for the logo

export default function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "admin" | "staff" | "viewer";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("inventory_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== role) {
      router.push("/login");
    } else {
      setUser(parsedUser);
    }
  }, [role, router]);

  const handleLogout = () => {
    localStorage.removeItem("inventory_user");
    router.push("/login");
  };

  const navLinks = {
    admin: [
      { name: "Dashboard", href: "/admin" },
      { name: "Inventory", href: "/admin/inventory" },
      { name: "Users", href: "/admin/users" },
      { name: "Sales", href: "/admin/sales" },
      { name: "Reports", href: "/admin/reports" },
      { name: "Alerts", href: "/admin/alerts" },
    ],
    staff: [
      { name: "Dashboard", href: "/staff" },
      { name: "Inventory", href: "/staff/inventory" },
      { name: "Operations", href: "/staff/operations" },
      { name: "Sales", href: "/staff/sales" },
      { name: "Reports", href: "/staff/reports" },
    ],
    viewer: [
      { name: "Dashboard", href: "/viewer" },
      { name: "Inventory", href: "/viewer/inventory" },
      { name: "Reports", href: "/viewer/reports" },
    ],
  };

  if (!user) return null;

  const links = navLinks[role];

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 font-sans">
      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between px-8 bg-[#1e1b4b] text-white">
        <div className="flex items-center space-x-12">
          {/* Logo */}
          <div className="flex items-center space-x-2 text-[#5a4bfa] font-black text-xl tracking-wider">
            <Package className="w-6 h-6" />
            <span>IMS</span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== `/${role}` && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-black uppercase tracking-widest transition-all ${
                    isActive 
                      ? "text-[#5a4bfa]" // Electric Violet for active
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User & Logout */}
        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-end leading-tight">
            <span className="text-[10px] font-black text-[#5a4bfa] uppercase tracking-widest">{user.role}</span>
            <span className="text-sm font-bold text-slate-300">{user.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-white text-[#1e1b4b] text-xs font-black rounded-xl hover:bg-slate-100 transition-all shadow-md uppercase tracking-widest"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-8">
        {children}
      </main>
    </div>
  );
}
