import {
  User,
  Bell,
  Shield,
  Globe,
  Zap,
  LucideIcon,
  Loader2,
} from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { api } from "@/lib/api";

type SettingsTab = "profile" | "api" | "notifications" | "security" | "region";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Failed to change password",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

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
              <Typography variant="title">Change Password</Typography>

              {passwordError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                  Password changed successfully!
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    disabled={isChangingPassword}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    disabled={isChangingPassword}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={isChangingPassword}
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>

              <div className="pt-4 border-t border-outline/10">
                <Typography variant="label" className="text-foreground/60 mb-4">
                  Two-Factor Authentication
                </Typography>
                <Button
                  variant="outlined"
                  className="w-full justify-start"
                  disabled
                >
                  Enable Two-Factor Authentication (Coming Soon)
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
