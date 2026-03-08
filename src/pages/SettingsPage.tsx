import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Password updated!" }); setNewPassword(""); }
  };

  const handleDeleteAccount = async () => {
    // In production, this would need a server-side function
    toast({ title: "Contact support to delete your account", description: "For security, account deletion requires verification." });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-display font-semibold">Account</h2>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <Button className="gradient-primary text-primary-foreground" onClick={handleChangePassword} disabled={saving}>
            {saving ? "Saving..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-display font-semibold">Theme Preference</h2>
          <div className="flex gap-3">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button key={t} variant={theme === t ? "default" : "outline"} size="sm" className={theme === t ? "gradient-primary text-primary-foreground" : ""} onClick={() => setTheme(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-destructive/20">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-display font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
          <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
