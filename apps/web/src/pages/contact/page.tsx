import { Mail, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import React, { useState } from "react";
import { api } from "../../lib/api";

function ContactTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className, ...rest } = props;
  return (
    <textarea
      className={
        "flex w-full px-3 py-2 text-sm transition-all duration-200 border rounded-md min-h-40 border-outline/50 bg-surface-variant/30 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50" +
        (className ? " " + className : "")
      }
      {...rest}
    />
  );
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await api.submitContactForm(formData);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to send message", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md p-12 space-y-6 text-center duration-300 animate-in zoom-in-95">
          <div className="flex items-center justify-center w-20 h-20 mx-auto text-green-500 rounded-full bg-green-500/10">
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
    <div className="max-w-5xl py-12 mx-auto space-y-12">
      <div className="space-y-4 text-center">
        <Typography variant="display" className="text-primary">
          Get in Touch
        </Typography>
        <Typography variant="body" className="text-xl opacity-70">
          Have a question or feedback? We'd love to hear from you.
        </Typography>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Contact Info */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 border-outline/5">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
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
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary">
              <MessageCircle size={20} />
            </div>

            <div className="space-y-2">
              <div>
                <Typography variant="title" className="text-sm">
                  Discord Community
                </Typography>
              </div>

              <Button
                variant="outlined"
                size="sm"
                className="w-full rounded-full"
                onClick={() =>
                  window.open("https://discord.gg/PpmKS8ZTPt", "_blank")
                }
              >
                Join Server
              </Button>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-8 shadow-xl md:col-span-2 border-outline/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

              <ContactTextarea
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
              className="w-full h-12 px-12 rounded-full md:w-auto"
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
      {/* Inline error message */}
      {errorMessage && (
        <Typography variant="body" className="text-sm text-red-500">
          {errorMessage}
        </Typography>
      )}
      );
    </div>
  );
}
