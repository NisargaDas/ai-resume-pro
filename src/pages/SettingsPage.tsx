import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      {/* Account */}
      <Card className="shadow-card">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-display font-semibold">Account</h2>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button
            className="gradient-primary text-primary-foreground"
            onClick={() => toast({ title: "Settings saved" })}
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="shadow-card">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-display font-semibold">Theme Preference</h2>
          <div className="flex gap-3">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button
                key={t}
                variant={theme === t ? "default" : "outline"}
                size="sm"
                className={theme === t ? "gradient-primary text-primary-foreground" : ""}
                onClick={() => setTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="shadow-card border-destructive/20">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-display font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
          <Button variant="destructive" size="sm">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
