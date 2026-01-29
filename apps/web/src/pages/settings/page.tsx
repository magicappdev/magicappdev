import {
  User,
  Bell,
  Shield,
  Globe,
  Zap,
  LucideIcon,
  Loader2,
  Link2,
  Unlink,
  Plus,
  Trash2,
} from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type SettingsTab = "profile" | "api" | "notifications" | "security" | "region";

interface LinkedAccount {
  id: string;
  provider: string;
  providerAccountId: string;
  createdAt: string;
}

interface UserApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: number;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.profile?.bio || "");
  const [region, setRegion] = useState(
    user?.profile?.region || "Automatic (Global)",
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // API Key state
  const [apiKeys, setApiKeys] = useState<UserApiKey[]>([]);
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // OAuth linking state
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(
    null,
  );
  const [linkError, setLinkError] = useState<string | null>(null);

  // Load linked accounts and API keys on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingAccounts(true);
      setIsLoadingApiKeys(true);
      try {
        console.log("Loading linked accounts and API keys...");
        console.log("Current user:", user);
        // Check if token is set in API client
        const token = localStorage.getItem("access_token");
        console.log("Token from localStorage:", token ? "Set" : "Not set");
        const [accounts, keys] = await Promise.all([
          api.getLinkedAccounts(),
          api.getUserApiKeys(),
        ]);
        console.log("Linked accounts loaded:", accounts);
        console.log("API keys loaded:", keys);
        setLinkedAccounts(accounts);
        setApiKeys(keys);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        setLinkError(
          error instanceof Error ? error.message : "Failed to load accounts",
        );
      } finally {
        setIsLoadingAccounts(false);
        setIsLoadingApiKeys(false);
      }
    };
    if (user) loadInitialData();
  }, [user]);

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.profile?.bio || "");
      setRegion(user.profile?.region || "Automatic (Global)");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(false);
    setIsSavingProfile(true);

    try {
      await api.updateProfile({ name, bio, region });
      setProfileSuccess(true);
      refreshUser();
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Failed to save profile",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleGenerateApiKey = async () => {
    const keyName = prompt("Enter a name for your new API key:");
    if (!keyName) return;

    setNewlyCreatedKey(null);
    setIsGeneratingKey(true);
    try {
      const result = await api.createUserApiKey(keyName);
      setNewlyCreatedKey(result.key);
      // Reload keys
      const keys = await api.getUserApiKeys();
      setApiKeys(keys);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to generate key");
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;
    try {
      await api.deleteUserApiKey(id);
      setApiKeys(prev => prev.filter(k => k.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete key");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setIsDeletingAccount(true);

    try {
      await api.deleteAccount();
      logout();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete account",
      );
      setIsDeletingAccount(false);
    }
  };

  const handleLinkAccount = (provider: "github" | "discord") => {
    const linkUrl = api.getLinkAccountUrl(provider);
    window.location.href = linkUrl;
  };

  const handleUnlinkAccount = async (provider: string) => {
    setLinkError(null);
    setUnlinkingProvider(provider);

    try {
      await api.unlinkAccount(provider);
      setLinkedAccounts(prev => prev.filter(acc => acc.provider !== provider));
    } catch (error) {
      setLinkError(
        error instanceof Error ? error.message : "Failed to unlink account",
      );
    } finally {
      setUnlinkingProvider(null);
    }
  };

  const isProviderLinked = (provider: string) =>
    linkedAccounts.some(acc => acc.provider === provider);

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    // Only currentPassword is required if they already have one
    if (user?.hasPassword && !currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setPasswordError("New passwords are required");
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
      await api.changePassword({
        currentPassword: user?.hasPassword ? currentPassword : undefined,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      refreshUser();
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Failed to update password",
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

                {profileError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {profileError}
                  </div>
                )}

                {profileSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                    Profile saved successfully!
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      placeholder="John Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={isSavingProfile}
                    />
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
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    disabled={isSavingProfile}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </Card>

              {/* OAuth Account Linking */}
              <Card className="p-6 space-y-6">
                <Typography variant="title">Connected Accounts</Typography>
                <Typography
                  variant="body"
                  className="text-sm text-foreground/60"
                >
                  Link your social accounts for easier sign-in
                </Typography>

                {linkError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {linkError}
                  </div>
                )}

                {isLoadingAccounts ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* GitHub */}
                    <div className="flex items-center justify-between p-4 bg-surface-variant rounded-lg border border-outline/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white dark:text-gray-900"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">GitHub</div>
                          <div className="text-sm text-foreground/60">
                            {isProviderLinked("github")
                              ? "Connected"
                              : "Not connected"}
                          </div>
                        </div>
                      </div>
                      {isProviderLinked("github") ? (
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => handleUnlinkAccount("github")}
                          disabled={unlinkingProvider === "github"}
                        >
                          {unlinkingProvider === "github" ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <>
                              <Unlink size={14} className="mr-1" />
                              Unlink
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="tonal"
                          size="sm"
                          onClick={() => handleLinkAccount("github")}
                        >
                          <Link2 size={14} className="mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>

                    {/* Discord */}
                    <div className="flex items-center justify-between p-4 bg-surface-variant rounded-lg border border-outline/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Discord</div>
                          <div className="text-sm text-foreground/60">
                            {isProviderLinked("discord")
                              ? "Connected"
                              : "Not connected"}
                          </div>
                        </div>
                      </div>
                      {isProviderLinked("discord") ? (
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => handleUnlinkAccount("discord")}
                          disabled={unlinkingProvider === "discord"}
                        >
                          {unlinkingProvider === "discord" ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <>
                              <Unlink size={14} className="mr-1" />
                              Unlink
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="tonal"
                          size="sm"
                          onClick={() => handleLinkAccount("discord")}
                        >
                          <Link2 size={14} className="mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6 space-y-6 border-error/20 bg-error/5">
                <Typography variant="title" className="text-error">
                  Danger Zone
                </Typography>
                <Typography variant="body" className="text-sm text-error/70">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </Typography>

                {deleteError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {deleteError}
                  </div>
                )}

                {!showDeleteConfirm ? (
                  <div>
                    <Button
                      variant="tonal"
                      className="bg-error text-white hover:bg-error/90"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 bg-error/10 rounded-lg border border-error/20">
                    <Typography variant="body" className="text-sm font-medium">
                      Are you sure? This action cannot be undone.
                    </Typography>
                    <div className="flex gap-3">
                      <Button
                        variant="tonal"
                        className="bg-error text-white hover:bg-error/90"
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                      >
                        {isDeletingAccount ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Yes, Delete My Account"
                        )}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeletingAccount}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}

          {activeTab === "api" && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="title">API Keys</Typography>
                  <Typography
                    variant="body"
                    className="text-sm text-foreground/60"
                  >
                    Manage your API keys for accessing the MagicAppDev API
                    programmatically.
                  </Typography>
                </div>
                <Button
                  onClick={handleGenerateApiKey}
                  disabled={isGeneratingKey}
                  size="sm"
                >
                  {isGeneratingKey ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : (
                    <Plus size={16} className="mr-2" />
                  )}
                  Generate New Key
                </Button>
              </div>

              {newlyCreatedKey && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-2 animate-in zoom-in-95 duration-300">
                  <Typography variant="label" className="text-green-500">
                    New Key Generated!
                  </Typography>
                  <p className="text-xs opacity-70">
                    Copy this key now. For security, it won't be shown again.
                  </p>
                  <div className="bg-surface p-3 rounded-lg border border-outline/10 font-mono text-xs break-all select-all">
                    {newlyCreatedKey}
                  </div>
                </div>
              )}

              {isLoadingApiKeys ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={32} className="animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map(key => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 bg-surface-variant/30 rounded-xl border border-outline/5"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{key.name}</div>
                        <div className="flex items-center gap-3 text-[10px] opacity-50 font-mono">
                          <span>Prefix: {key.keyPrefix}...</span>
                          <span>•</span>
                          <span>
                            Created{" "}
                            {new Date(key.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="text"
                        size="sm"
                        className="text-error h-8 w-8 p-0"
                        onClick={() => handleDeleteApiKey(key.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                  {apiKeys.length === 0 && !newlyCreatedKey && (
                    <div className="p-12 border border-dashed border-outline/20 rounded-2xl text-center">
                      <Typography variant="body" className="opacity-40 italic">
                        No API keys generated yet.
                      </Typography>
                    </div>
                  )}
                </div>
              )}
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
              <Typography variant="title">
                {user.hasPassword ? "Change Password" : "Set Account Password"}
              </Typography>

              <Typography variant="body" className="text-sm text-foreground/60">
                {user.hasPassword
                  ? "Update your existing password."
                  : "You're currently signed in via OAuth. Set a password to enable direct login."}
              </Typography>

              {passwordError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                  Password updated successfully!
                </div>
              )}

              <div className="space-y-4">
                {user.hasPassword && (
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
                )}
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
                      Saving...
                    </>
                  ) : user.hasPassword ? (
                    "Update Password"
                  ) : (
                    "Set Password"
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
              <Typography variant="body" className="text-sm text-foreground/60">
                Choose the primary region for your data and deployments.
              </Typography>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Region</label>
                  <select
                    className="w-full p-3 rounded-xl bg-surface border border-outline/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    disabled={isSavingProfile}
                  >
                    <option value="Automatic (Global)">
                      Automatic (Global)
                    </option>
                    <option value="North America (East)">
                      North America (East)
                    </option>
                    <option value="North America (West)">
                      North America (West)
                    </option>
                    <option value="Europe (Frankfurt)">
                      Europe (Frankfurt)
                    </option>
                    <option value="Europe (London)">Europe (London)</option>
                    <option value="Asia Pacific (Tokyo)">
                      Asia Pacific (Tokyo)
                    </option>
                    <option value="Asia Pacific (Singapore)">
                      Asia Pacific (Singapore)
                    </option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={
                      isSavingProfile || region === user.profile?.region
                    }
                  >
                    {isSavingProfile ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <Globe size={16} className="mr-2" />
                    )}
                    Update Region
                  </Button>
                </div>
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
