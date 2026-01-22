import { Mail, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import React, { useState } from "react";
import { api } from "../../lib/api";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.submitContactForm(formData);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to send message", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full p-12 text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <Typography variant="headline">Message Sent!</Typography>
            <Typography variant="body" className="opacity-70">
              Thank you for reaching out. We'll get back to you at{" "}
              {formData.email} as soon as possible.
            </Typography>
          </div>
          <Button
            className="w-full rounded-full"
            onClick={() => setSubmitted(false)}
          >
            Send Another Message
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 space-y-12">
      <div className="text-center space-y-4">
        <Typography variant="display" className="text-primary">
          Get in Touch
        </Typography>
        <Typography variant="body" className="text-xl opacity-70">
          Have a question or feedback? We'd love to hear from you.
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 border-outline/5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Mail size={20} />
            </div>
            <div>
              <Typography variant="title" className="text-sm">
                Email Us
              </Typography>
              <Typography variant="body" className="text-sm opacity-60">
                dev.magicapp@gmail.com
              </Typography>
            </div>
          </Card>

          <Card className="p-6 space-y-4 border-outline/5">
            <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
              <MessageCircle size={20} />
            </div>
            <div>
              <Typography variant="title" className="text-sm">
                Discord
              </Typography>
              <Typography variant="body" className="text-sm opacity-60">
                Join our community
              </Typography>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="md:col-span-2 p-8 border-outline/10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                required
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <Input
              label="Subject"
              placeholder="How can we help?"
              required
              value={formData.subject}
              onChange={e =>
                setFormData({ ...formData, subject: e.target.value })
              }
            />

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80">
                Message
              </label>
              <textarea
                className="flex min-h-[150px] w-full rounded-md border border-outline/50 bg-surface-variant/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                placeholder="Tell us more about your project..."
                required
                value={formData.message}
                onChange={e =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto px-12 rounded-full h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                "Sending..."
              ) : (
                <>
                  Send Message <Send size={18} className="ml-2" />
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
