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
  X,
  FileText,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";
import type {
  AdminUser,
  SystemLog,
  GlobalConfig,
} from "@magicappdev/shared/api";
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
  const [stats, setStats] = useState({
    totalUsers: 0,
    openTickets: 0,
    databaseSize: "0 MB",
    activeSessions: 0,
    userGrowth: "0%",
    ticketUrgency: "0 priority",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // View states
  const [view, setView] = useState<"users" | "logs" | "config">("users");
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [config, setConfig] = useState<GlobalConfig | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setIsActionLoading(true);
    try {
      const logsData = await api.getSystemLogs({ limit: 50 });
      setLogs(logsData);
      setView("logs");
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const fetchConfig = async () => {
    setIsActionLoading(true);
    try {
      const configData = await api.getGlobalConfig();
      setConfig(configData);
      setView("config");
    } catch (err) {
      console.error("Failed to fetch config", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchData();
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
    if (!confirm(`Are you sure you want to change this user to ${newRole}?`))
      return;

    try {
      await api.updateUserRole(userId, newRole);
      fetchData();
    } catch (err) {
      console.error("Failed to update role", err);
      alert("Failed to update role");
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsActionLoading(true);
    try {
      await api.updateGlobalConfig(config);
      alert("Configuration updated successfully");
    } catch (err) {
      console.error("Failed to update config", err);
      alert("Failed to update configuration");
    } finally {
      setIsActionLoading(false);
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
          <Button
            variant={view === "logs" ? "tonal" : "outlined"}
            size="sm"
            onClick={fetchLogs}
            disabled={isActionLoading}
          >
            {isActionLoading && view === "logs" ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Activity size={16} className="mr-2" />
            )}
            System Logs
          </Button>
          <Button
            variant={view === "config" ? "tonal" : "outlined"}
            size="sm"
            onClick={fetchConfig}
            disabled={isActionLoading}
          >
            {isActionLoading && view === "config" ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Shield size={16} className="mr-2" />
            )}
            Global Config
          </Button>
          {view !== "users" && (
            <Button variant="text" size="sm" onClick={() => setView("users")}>
              <X size={16} className="mr-2" /> Back
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toString()}
          subValue={`${stats.userGrowth} this month`}
          icon={Users}
        />
        <StatsCard
          title="Open Tickets"
          value={stats.openTickets.toString()}
          subValue={stats.ticketUrgency}
          icon={Activity}
        />
        <StatsCard
          title="Database Size"
          value={stats.databaseSize}
          subValue="Active"
          icon={Database}
        />
        <StatsCard
          title="Active Sessions"
          value={stats.activeSessions.toString()}
          subValue="Real-time"
          icon={Shield}
        />
      </div>

      {view === "users" && (
        /* User Management */
        <Card className="p-0 overflow-hidden border-outline/10 shadow-lg animate-in slide-in-from-bottom-4 duration-300">
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
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold overflow-hidden">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            u.name?.[0] || "?"
                          )}
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
                        <Button
                          variant="text"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Send Email"
                        >
                          <Mail size={14} />
                        </Button>
                        <Button
                          variant="text"
                          size="sm"
                          className="h-8 w-8 p-0 text-error"
                          title="Delete User"
                          onClick={() =>
                            confirm(`Delete user ${u.name}?`) &&
                            api.deleteAccount()
                          } // Placeholder
                        >
                          <Trash2 size={14} />
                        </Button>
                        <Button
                          variant="text"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => alert(`User ID: ${u.id}`)}
                        >
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
      )}

      {view === "logs" && (
        <Card className="p-0 overflow-hidden border-outline/10 shadow-lg animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface-variant/10">
            <div className="flex items-center gap-2">
              <FileText className="text-primary" size={20} />
              <Typography variant="title" className="text-base">
                System Logs
              </Typography>
            </div>
            <Button variant="text" size="sm" onClick={() => fetchLogs()}>
              Refresh
            </Button>
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-variant/20 sticky top-0 z-10 border-b border-outline/10">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase text-foreground/50 w-32">
                    Time
                  </th>
                  <th className="px-4 py-3 font-bold uppercase text-foreground/50 w-20">
                    Level
                  </th>
                  <th className="px-4 py-3 font-bold uppercase text-foreground/50">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-surface-variant/10">
                    <td className="px-4 py-2 opacity-50">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          log.level === "error"
                            ? "bg-error/10 text-error"
                            : log.level === "warn"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-2">{log.message}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center opacity-40">
                      No logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {view === "config" && config && (
        <Card className="p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <SettingsIcon className="text-primary" size={20} />
            <Typography variant="title">Platform Configuration</Typography>
          </div>
          <form
            onSubmit={handleUpdateConfig}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-variant/20 rounded-xl border border-outline/5">
                <div>
                  <div className="text-sm font-medium">Maintenance Mode</div>
                  <div className="text-[10px] opacity-50">
                    Disable all non-admin access
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.maintenanceMode}
                  onChange={e =>
                    setConfig({ ...config, maintenanceMode: e.target.checked })
                  }
                  className="toggle"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-variant/20 rounded-xl border border-outline/5">
                <div>
                  <div className="text-sm font-medium">Enable Registration</div>
                  <div className="text-[10px] opacity-50">
                    Allow new users to sign up
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableRegistration}
                  onChange={e =>
                    setConfig({
                      ...config,
                      enableRegistration: e.target.checked,
                    })
                  }
                  className="toggle"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50">
                  Rate Limit (per min)
                </label>
                <input
                  type="number"
                  value={config.rateLimitPerMinute}
                  onChange={e =>
                    setConfig({
                      ...config,
                      rateLimitPerMinute: parseInt(e.target.value),
                    })
                  }
                  className="w-full bg-surface border border-outline/20 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50">
                  Session Expiry (days)
                </label>
                <input
                  type="number"
                  value={config.sessionExpiryDays}
                  onChange={e =>
                    setConfig({
                      ...config,
                      sessionExpiryDays: parseInt(e.target.value),
                    })
                  }
                  className="w-full bg-surface border border-outline/20 rounded-lg p-2 text-sm"
                />
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isActionLoading}>
                {isActionLoading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Shield size={16} className="mr-2" />
                )}
                Save Configuration
              </Button>
            </div>
          </form>
        </Card>
      )}
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
