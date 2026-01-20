import { User, Bell, Shield, Globe, Zap, LucideIcon } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useState } from "react";

type SettingsTab = "profile" | "api" | "notifications" | "security" | "region";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  if (!user) return null;

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
          <SettingsNavItem
            icon={User}
            label="Profile"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
          <SettingsNavItem
            icon={Zap}
            label="API Keys"
            active={activeTab === "api"}
            onClick={() => setActiveTab("api")}
          />
          <SettingsNavItem
            icon={Bell}
            label="Notifications"
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
          />
          <SettingsNavItem
            icon={Shield}
            label="Security"
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
          />
          <SettingsNavItem
            icon={Globe}
            label="Region"
            active={activeTab === "region"}
            onClick={() => setActiveTab("region")}
          />
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "profile" && (
            <>
              <Card className="p-6 space-y-6">
                <Typography variant="title">Profile Information</Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input placeholder="John Doe" defaultValue={user.name} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      placeholder="user@example.com"
                      defaultValue={user.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <Input
                    placeholder="Tell us about yourself"
                    defaultValue={user.profile?.bio || ""}
                  />
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
                  Once you delete your account, there is no going back. Please
                  be certain.
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
            </>
          )}

          {activeTab === "api" && (
            <Card className="p-6 space-y-6">
              <Typography variant="title">API Keys</Typography>
              <Typography variant="body" className="text-sm text-foreground/60">
                Manage your API keys for accessing the MagicAppDev API
                programmatically.
              </Typography>
              <div className="p-4 bg-surface-variant rounded-lg border border-outline/10 text-center text-foreground/50">
                No API keys generated yet.
              </div>
              <Button>Generate New Key</Button>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="p-6 space-y-6">
              <Typography variant="title">Notifications</Typography>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-foreground/60">
                      Receive updates about your projects
                    </div>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Marketing Emails</div>
                    <div className="text-sm text-foreground/60">
                      Receive news and special offers
                    </div>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="p-6 space-y-6">
              <Typography variant="title">Security</Typography>
              <div className="space-y-4">
                <Button variant="outlined" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outlined" className="w-full justify-start">
                  Enable Two-Factor Authentication
                </Button>
              </div>
            </Card>
          )}

          {activeTab === "region" && (
            <Card className="p-6 space-y-6">
              <Typography variant="title">Region</Typography>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Region</label>
                <select className="w-full p-2 rounded-md bg-surface border border-outline/20">
                  <option>Automatic (Global)</option>
                  <option>North America</option>
                  <option>Europe</option>
                  <option>Asia Pacific</option>
                </select>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsNavItem({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
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
