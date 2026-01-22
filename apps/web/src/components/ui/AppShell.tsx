import {
  Home,
  Folder,
  Menu,
  MessageSquare,
  Settings,
  X,
  LogOut,
  Info,
  Mail,
  Ticket,
  ShieldCheck,
} from "lucide-react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { ReactNode, useState } from "react";
import { Typography } from "./Typography";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, isLoading, logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Define protected routes
  const protectedRoutes = [
    "/chat",
    "/projects",
    "/settings",
    "/tickets",
    "/admin",
  ];
  const isProtectedRoute = protectedRoutes.some(route =>
    location.pathname.startsWith(route),
  );

  if (!user && isProtectedRoute) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "About", icon: Info, href: "/about" },
    { label: "Contact", icon: Mail, href: "/contact" },
  ];

  if (user) {
    navItems.push(
      { label: "Projects", icon: Folder, href: "/projects" },
      { label: "Chat", icon: MessageSquare, href: "/chat" },
      { label: "Tickets", icon: Ticket, href: "/tickets" },
      { label: "Settings", icon: Settings, href: "/settings" },
    );

    if (user.role === "admin") {
      navItems.push({ label: "Admin", icon: ShieldCheck, href: "/admin" });
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-outline/10 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" className="w-8 h-8" alt="MagicApp Logo" />
          <Typography variant="title" className="text-primary font-bold">
            MagicApp
          </Typography>
        </div>
        <Button variant="text" size="sm" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </header>

      {/* Sidebar (Desktop & Mobile) */}
      <AnimatePresence mode="wait">
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed md:static inset-y-0 left-0 z-40 w-64 bg-surface-variant/20 border-r border-outline/10 backdrop-blur-xl md:backdrop-blur-none md:bg-transparent flex flex-col p-6 space-y-8",
              isSidebarOpen ? "block" : "hidden md:flex",
            )}
          >
            <div className="hidden md:flex items-center space-x-2">
              <img src="/logo.png" className="w-10 h-10" alt="MagicApp Logo" />
              <Typography variant="headline" className="text-xl">
                MagicApp
              </Typography>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map(item => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    to={item.href}
                    key={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-full transition-all duration-200 group cursor-pointer",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground/70 hover:bg-surface-variant hover:text-foreground",
                      )}
                    >
                      <item.icon
                        size={20}
                        className={cn(
                          isActive
                            ? "text-primary"
                            : "text-foreground/50 group-hover:text-foreground",
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-outline/10 space-y-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <img
                      src={
                        user.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
                      }
                      className="w-10 h-10 rounded-full border border-outline/20"
                      alt={user.name}
                    />

                    <div className="flex-1 min-w-0">
                      <Typography
                        variant="label"
                        className="normal-case text-foreground truncate"
                      >
                        {user.name}
                      </Typography>

                      <Typography
                        variant="label"
                        className="text-[10px] text-foreground/50 uppercase"
                      >
                        {user.role}
                      </Typography>
                    </div>
                  </div>

                  <Button
                    variant="text"
                    size="sm"
                    className="w-full justify-start text-foreground/60 hover:text-error"
                    onClick={logout}
                  >
                    <LogOut size={18} className="mr-3" /> Logout
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button className="w-full">Login</Button>
                </Link>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">{children}</div>
      </main>
    </div>
  );
}
