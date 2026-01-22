import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import type { Ticket } from "@magicappdev/shared/api";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { api } from "../../lib/api";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({ subject: "", message: "" });

  const fetchTickets = async () => {
    try {
      const data = await api.getTickets();
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle size={14} className="text-blue-500" />;
      case "in_progress":
        return <Clock size={14} className="text-yellow-500" />;
      case "closed":
        return <CheckCircle2 size={14} className="text-green-500" />;
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTicket(formData);
      setShowNewForm(false);
      setFormData({ subject: "", message: "" });
      fetchTickets();
      alert("Ticket created successfully!");
    } catch (err) {
      console.error("Failed to create ticket", err);
      alert("Failed to create ticket");
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
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="headline">Support Tickets</Typography>
          <Typography variant="body" className="opacity-60 text-sm">
            Need help? Create a ticket and we'll assist you.
          </Typography>
        </div>
        <Button size="sm" onClick={() => setShowNewForm(!showNewForm)}>
          <Plus size={16} className="mr-2" />{" "}
          {showNewForm ? "Back to List" : "New Ticket"}
        </Button>
      </div>

      {showNewForm ? (
        <Card className="p-8 border-outline/10 shadow-xl max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Typography variant="title">Create a Support Ticket</Typography>
            <Input
              label="Subject"
              placeholder="Brief summary of the issue"
              required
              value={formData.subject}
              onChange={e =>
                setFormData({ ...formData, subject: e.target.value })
              }
            />
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80">
                Description
              </label>
              <textarea
                className="flex min-h-[150px] w-full rounded-md border border-outline/50 bg-surface-variant/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                placeholder="Describe your problem in detail..."
                required
                value={formData.message}
                onChange={e =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-full">
              Submit Ticket
            </Button>
          </form>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <Card
              key={ticket.id}
              className="p-4 hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Typography variant="title" className="text-sm">
                        {ticket.subject}
                      </Typography>
                      {ticket.userEmail && (
                        <span className="text-xs opacity-40">
                          by {ticket.userName || ticket.userEmail}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(ticket.status)}
                        <span className="text-xs capitalize opacity-60">
                          {ticket.status.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-xs opacity-30">•</span>
                      <span className="text-xs opacity-60">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all"
                />
              </div>
            </Card>
          ))}

          {tickets.length === 0 && (
            <div className="text-center py-20 opacity-40">
              <MessageSquare size={48} className="mx-auto mb-4" />
              <Typography>No active tickets found.</Typography>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
