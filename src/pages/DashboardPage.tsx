import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText, Download, Eye, Target, Plus, Sparkles, Upload, Search,
  MoreHorizontal, TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("resumes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);
      setProfile(p);
      setResumes(r || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "there";
  const totalResumes = resumes.length;
  const totalDownloads = resumes.reduce((s, r) => s + (r.downloads || 0), 0);
  const totalViews = resumes.reduce((s, r) => s + (r.views || 0), 0);
  const avgATS = resumes.length > 0
    ? Math.round(resumes.filter(r => r.ats_score).reduce((s, r) => s + r.ats_score, 0) / Math.max(resumes.filter(r => r.ats_score).length, 1))
    : 0;

  const stats = [
    { title: "Resumes Created", value: String(totalResumes), icon: FileText, change: "All time" },
    { title: "Downloads", value: String(totalDownloads), icon: Download, change: "Total" },
    { title: "Resume Views", value: String(totalViews), icon: Eye, change: "Total" },
    { title: "Avg ATS Score", value: avgATS ? `${avgATS}%` : "N/A", icon: Target, change: resumes.length ? "Across resumes" : "No resumes yet" },
  ];

  const quickActions = [
    { title: "Create Resume", icon: Plus, color: "gradient-primary", path: "/builder" },
    { title: "Cover Letter", icon: Sparkles, color: "gradient-accent", path: "/ai-tools" },
    { title: "Templates", icon: Upload, color: "gradient-hero", path: "/templates" },
    { title: "Analyze Resume", icon: Search, color: "gradient-primary", path: "/ai-tools" },
  ];

  const profileComplete = [
    { label: "Add skills", done: (profile?.skills?.length || 0) > 0 },
    { label: "Set headline", done: !!profile?.headline },
    { label: "Set location", done: !!profile?.location },
    { label: "Create a resume", done: resumes.length > 0 },
  ];
  const pctDone = Math.round((profileComplete.filter(t => t.done).length / profileComplete.length) * 100);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">Welcome back, {displayName}! 👋</h1>
        <p className="text-muted-foreground mt-1">Ready to build your next resume?</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xs text-accent mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Button key={action.title} variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:shadow-elevated transition-all" onClick={() => navigate(action.path)}>
              <div className={`h-10 w-10 rounded-xl ${action.color} flex items-center justify-center`}>
                <action.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">{action.title}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Recent Resumes</h2>
          {resumes.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No resumes yet. Create your first one!</p>
                <Button className="mt-4 gradient-primary text-primary-foreground" onClick={() => navigate("/builder")}>
                  <Plus className="h-4 w-4 mr-2" /> Create Resume
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <Card key={resume.id} className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{resume.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {resume.template} · {new Date(resume.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {resume.ats_score && <span className="text-sm font-medium text-accent">{resume.ats_score}%</span>}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/builder/${resume.id}`)}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Profile Completion</h2>
          <Card className="shadow-card">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{pctDone}% Complete</span>
                <span className="text-xs text-muted-foreground">{profileComplete.filter(t => t.done).length}/{profileComplete.length}</span>
              </div>
              <Progress value={pctDone} className="h-2" />
              <div className="space-y-2">
                {profileComplete.map((task) => (
                  <div key={task.label} className="flex items-center gap-2 text-sm">
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${task.done ? "bg-accent border-accent" : "border-muted-foreground"}`}>
                      {task.done && <span className="text-accent-foreground text-[10px]">✓</span>}
                    </div>
                    <span className={task.done ? "text-muted-foreground line-through" : "text-foreground"}>{task.label}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate("/profile")}>Complete Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
