// src/app/(app)/(admin)/layout.tsx
"use client";

import {
    BarChart3,
    FileText, Folder,
    LayoutDashboard,
    LogOut,
    Menu, Tag,
    Users,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

// Define the type for nav items
interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
}

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { data: profile } = trpc.user.getProfile.useQuery();

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/sign-in");
    };

    const navItems: NavItem[] = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Templates", href: "/admin/templates", icon: FileText },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { name: "Tags", href: "/admin/tags", icon: Tag },
        { name: "Collections", href: "/admin/collections", icon: Folder },
        { name: "Sample Content", href: "/admin/sample-content", icon: FileText },
    ];

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(path + "/");
    };

    return (
        <div className="flex min-h-screen">
            {/* Mobile sidebar toggle */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="fixed top-4 left-4 z-50 md:hidden"
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <div className="flex h-full flex-col">
                        <div className="border-b p-4">
                            <h2 className="font-semibold text-lg">Admin Dashboard</h2>
                        </div>
                        <nav className="flex-1 overflow-y-auto py-4">
                            <ul className="space-y-1 px-2">
                                {navItems.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href as any} // Type assertion to fix the error
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                                isActive(item.href)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:bg-muted"
                                            }`}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-sidebar md:flex">
                <div className="border-b p-4">
                    <h2 className="font-semibold text-lg">Admin Dashboard</h2>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href as any} // Type assertion to fix the error
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                        isActive(item.href)
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="border-t p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            {profile?.user?.name?.charAt(0) || "A"}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-sm">
                                {profile?.user?.name || "Admin"}
                            </p>
                            <p className="truncate text-muted-foreground text-xs">
                                {profile?.user?.email}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSignOut}
                            className="h-8 w-8"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto">{children}</div>
            </main>
        </div>
    );
}
