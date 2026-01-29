import {
  ArrowLeft,
  MessageSquare,
  Clock,
  AlertCircle,
  Calendar,
  User as UserIcon,
  Mail,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Typography } from "@/components/ui/Typography";
import type { Ticket } from "@magicappdev/shared/api";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getTicket(id);
        setTicket(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ticket");
      } finally {
        setIsLoading(false);
      }
    }
    loadTicket();
  }, [id]);

  const handleUpdateStatus = async (
    newStatus: "open" | "in_progress" | "closed" | "resolved",
  ) => {
    if (!ticket) return;
    setIsUpdating(true);
    try {
      await api.updateTicketStatus(ticket.id, newStatus);
      const updated = await api.getTicket(ticket.id);
      setTicket(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Open
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            In Progress
          </span>
        );
      case "closed":
        return (
          <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/20">
            Closed
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/20">
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <Typography>Loading ticket details...</Typography>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertTriangle className="w-12 h-12 text-error" />
        <Typography variant="title">{error || "Ticket not found"}</Typography>
        <Button onClick={() => navigate("/tickets")}>
          <ArrowLeft size={16} className="mr-2" /> Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/tickets")}
            className="flex items-center text-sm text-foreground/50 hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft size={14} className="mr-1" /> Back to Tickets
          </button>
          <div className="flex items-center gap-3">
            <Typography variant="headline">{ticket.subject}</Typography>
            {getStatusBadge(ticket.status)}
          </div>
          <div className="flex items-center gap-4 text-xs text-foreground/50">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(ticket.createdAt).toLocaleDateString()}
            </div>
            {ticket.userEmail && (
              <div className="flex items-center gap-1">
                <UserIcon size={12} />
                {ticket.userName} ({ticket.userEmail})
              </div>
            )}
          </div>
        </div>

        {user?.role === "admin" && (
          <div className="flex items-center gap-2">
            <select
              className="bg-surface border border-outline/20 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={ticket.status}
              onChange={e =>
                handleUpdateStatus(e.target.value as Ticket["status"])
              }
              disabled={isUpdating}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
              <option value="resolved">Resolved</option>
            </select>
            {isUpdating && (
              <Loader2 size={16} className="animate-spin text-primary" />
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Message Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden border-outline/10 shadow-lg">
            <div className="p-4 border-b border-outline/10 bg-surface-variant/10 flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" />
              <Typography
                variant="title"
                className="text-xs font-bold uppercase tracking-wider text-foreground/50"
              >
                Ticket Description
              </Typography>
            </div>
            <div className="p-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {ticket.message || "No description provided."}
              </p>
            </div>
          </Card>

          {/* Response area - Placeholder for now */}
          <Card className="p-6 space-y-4 bg-primary/5 border-primary/10">
            <Typography variant="title" className="text-sm">
              Leave a Reply
            </Typography>
            <textarea
              className="w-full min-h-[120px] bg-surface border border-outline/20 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="This feature is coming soon..."
              disabled
            />
            <div className="flex justify-end">
              <Button disabled>Post Reply</Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <Typography variant="title" className="text-base">
              Support Info
            </Typography>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Mail size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-foreground/40">
                    Requester
                  </div>
                  <div className="text-sm font-medium">
                    {ticket.userName || "User"}
                  </div>
                  <div className="text-[10px] opacity-50">
                    {ticket.userEmail}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Clock size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-foreground/40">
                    Last Activity
                  </div>
                  <div className="text-sm font-medium">
                    {ticket.updatedAt
                      ? new Date(ticket.updatedAt).toLocaleDateString()
                      : new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-outline/10">
              <Typography
                variant="body"
                className="text-[10px] text-foreground/40"
              >
                Ticket ID: <span className="font-mono">{ticket.id}</span>
              </Typography>
            </div>
          </Card>

          <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 flex gap-3">
            <AlertCircle className="text-yellow-500 shrink-0" size={18} />
            <p className="text-[10px] text-yellow-600/80 leading-normal">
              Our team typically responds within 24-48 hours. Thank you for your
              patience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
