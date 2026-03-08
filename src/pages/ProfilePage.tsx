import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Mail, Briefcase, Plus, Trash2, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      setProfile(data || { full_name: "", headline: "", location: "", skills: [] });
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      headline: profile.headline,
      location: profile.location,
      skills: profile.skills,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Profile saved!" });
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...(profile.skills || []), newSkill.trim()] });
      setNewSkill("");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const initials = (profile?.full_name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="shadow-card overflow-hidden">
        <div className="h-24 gradient-hero" />
        <CardContent className="p-6 -mt-10">
          <div className="flex items-end gap-4">
            <Avatar className="h-20 w-20 border-4 border-card shadow-elevated">
              <AvatarFallback className="gradient-primary text-primary-foreground text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-1 space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
                <Input value={profile?.full_name || ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Headline</Label>
                <Input value={profile?.headline || ""} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} placeholder="e.g., Senior Software Engineer" />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {user?.email}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Location</Label>
              <Input value={profile?.location || ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="e.g., San Francisco, CA" />
            </div>
          </div>
          <Button className="mt-4 gradient-primary text-primary-foreground" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-5">
          <h2 className="font-display font-semibold text-foreground mb-3">Skills</h2>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Add a skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} />
            <Button onClick={addSkill} size="sm"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(profile?.skills || []).map((skill: string) => (
              <Badge key={skill} variant="secondary" className="gap-1">
                {skill}
                <button onClick={() => setProfile({ ...profile, skills: profile.skills.filter((s: string) => s !== skill) })} className="hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
