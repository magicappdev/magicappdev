import { User, Bell, Shield, Globe, Zap, LucideIcon } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Typography variant="headline">Settings</Typography>
        <Typography variant="body" className="text-sm">
          Manage your account and platform preferences
        </Typography>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          <SettingsNavItem icon={User} label="Profile" active />
          <SettingsNavItem icon={Zap} label="API Keys" />
          <SettingsNavItem icon={Bell} label="Notifications" />
          <SettingsNavItem icon={Shield} label="Security" />
          <SettingsNavItem icon={Globe} label="Region" />
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-6">
            <Typography variant="title">Profile Information</Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input placeholder="John Doe" defaultValue="Magic User" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  placeholder="user@example.com"
                  defaultValue="user@magicappdev.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Input placeholder="Tell us about yourself" />
            </div>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </Card>

          <Card className="p-6 space-y-6 border-error/20 bg-error/5">
            <Typography variant="title" className="text-error">
              Danger Zone
            </Typography>
            <Typography variant="body" className="text-sm text-error/70">
              Once you delete your account, there is no going back. Please be
              certain.
            </Typography>
            <div>
              <Button
                variant="tonal"
                className="bg-error text-white hover:bg-error/90"
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SettingsNavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
        active
          ? "bg-primary/10 text-primary font-medium"
          : "hover:bg-surface-variant text-foreground/70"
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </div>
  );
}
