import {
  Users,
  Shield,
  Database,
  Activity,
  Search,
  MoreHorizontal,
  Mail,
  Trash2,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import type { AdminUser } from "@magicappdev/shared/api";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "../../contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Navigate } from "react-router-dom";
import { api } from "../../lib/api";

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser]);

  if (currentUser?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const filteredUsers = users.filter(
    u =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false,
  );

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await api.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update role", err);
      alert("Failed to update role");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div className="flex justify-between items-end">
        <div>
          <Typography variant="headline">Admin Console</Typography>
          <Typography variant="body" className="opacity-60 text-sm">
            Manage users, tickets, and platform settings.
          </Typography>
        </div>
        <div className="flex gap-2">
          <Button variant="outlined" size="sm">
            <Activity size={16} className="mr-2" /> System Logs
          </Button>
          <Button size="sm">
            <Shield size={16} className="mr-2" /> Global Config
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={users.length.toString()}
          subValue="+12% this month"
          icon={Users}
        />
        <StatsCard
          title="Open Tickets"
          value="24"
          subValue="5 high priority"
          icon={Activity}
        />
        <StatsCard
          title="Database Size"
          value="4.2 GB"
          subValue="82% capacity"
          icon={Database}
        />
        <StatsCard
          title="Active Sessions"
          value="156"
          subValue="Real-time"
          icon={Shield}
        />
      </div>

      {/* User Management */}
      <Card className="p-0 overflow-hidden border-outline/10 shadow-lg">
        <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface-variant/10">
          <Typography variant="title" className="text-base">
            User Management
          </Typography>
          <div className="relative w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
              size={16}
            />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-surface border border-outline/20 rounded-full py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-variant/20 border-b border-outline/10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-foreground/50">
                  User
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-foreground/50">
                  Role
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-foreground/50">
                  Joined
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-foreground/50 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {filteredUsers.map(u => (
                <tr
                  key={u.id}
                  className="hover:bg-surface-variant/10 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {u.name?.[0] || "?"}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{u.name}</div>
                        <div className="text-xs opacity-50">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleRole(u.id, u.role)}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase hover:opacity-80 transition-opacity ${
                        u.role === "admin"
                          ? "bg-purple-500/10 text-purple-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {u.role}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs opacity-60">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="text" size="sm" className="h-8 w-8 p-0">
                        <Mail size={14} />
                      </Button>
                      <Button
                        variant="text"
                        size="sm"
                        className="h-8 w-8 p-0 text-error"
                      >
                        <Trash2 size={14} />
                      </Button>
                      <Button variant="text" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  subValue,
  icon: Icon,
}: {
  title: string;
  value: string;
  subValue: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="p-6 space-y-2 border-outline/5 hover:border-primary/20 transition-colors">
      <div className="flex justify-between items-start">
        <div className="p-2 rounded-lg bg-surface-variant/50 text-primary">
          <Icon size={20} />
        </div>
      </div>
      <div>
        <Typography
          variant="label"
          className="text-xs opacity-50 font-bold uppercase"
        >
          {title}
        </Typography>
        <Typography variant="headline" className="text-2xl">
          {value}
        </Typography>
        <Typography
          variant="body"
          className="text-[10px] text-green-500 font-medium"
        >
          {subValue}
        </Typography>
      </div>
    </Card>
  );
}
