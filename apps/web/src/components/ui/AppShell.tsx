import {
  LayoutDashboard,
  Folder,
  Menu,
  MessageSquare,
  Settings,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Projects", icon: Folder, href: "/projects" },
    { label: "Chat", icon: MessageSquare, href: "/chat" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-outline/10 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <Typography variant="title" className="text-primary font-bold">
          MagicApp
        </Typography>
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
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-primary" />
              </div>
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

            <div className="pt-6 border-t border-outline/10">
              <div className="flex items-center space-x-3 px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-tertiary" />
                <div>
                  <Typography
                    variant="label"
                    className="normal-case text-foreground"
                  >
                    User Profile
                  </Typography>
                  <Typography
                    variant="label"
                    className="text-[10px] text-foreground/50"
                  >
                    Pro Plan
                  </Typography>
                </div>
              </div>
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
