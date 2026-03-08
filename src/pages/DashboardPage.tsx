import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Download,
  Eye,
  Target,
  Plus,
  Sparkles,
  Upload,
  Search,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  { title: "Resumes Created", value: "12", icon: FileText, change: "+3 this month" },
  { title: "Downloads", value: "48", icon: Download, change: "+12 this week" },
  { title: "Resume Views", value: "234", icon: Eye, change: "+45 this week" },
  { title: "Avg ATS Score", value: "82%", icon: Target, change: "+5% improvement" },
];

const quickActions = [
  { title: "Create Resume", icon: Plus, color: "gradient-primary", path: "/builder" },
  { title: "Cover Letter", icon: Sparkles, color: "gradient-accent", path: "/ai-tools" },
  { title: "Upload Resume", icon: Upload, color: "gradient-hero", path: "/builder" },
  { title: "Analyze Resume", icon: Search, color: "gradient-primary", path: "/ai-tools" },
];

const recentResumes = [
  { title: "Software Engineer Resume", template: "Modern", date: "Mar 5, 2026", score: 88 },
  { title: "Product Manager CV", template: "Professional", date: "Mar 2, 2026", score: 76 },
  { title: "Data Analyst Resume", template: "Minimal", date: "Feb 28, 2026", score: 92 },
];

const profileTasks = [
  { label: "Add skills", completed: true },
  { label: "Add work experience", completed: true },
  { label: "Add projects", completed: false },
  { label: "Add certifications", completed: false },
  { label: "Add education", completed: true },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const completedTasks = profileTasks.filter((t) => t.completed).length;
  const profileProgress = (completedTasks / profileTasks.length) * 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome back, John! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Ready to build your next resume?
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
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

      {/* Quick Actions */}
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:shadow-elevated transition-all"
              onClick={() => navigate(action.path)}
            >
              <div className={`h-10 w-10 rounded-xl ${action.color} flex items-center justify-center`}>
                <action.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">{action.title}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Resumes */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Recent Resumes</h2>
          <div className="space-y-3">
            {recentResumes.map((resume) => (
              <Card key={resume.title} className="shadow-card hover:shadow-elevated transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{resume.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {resume.template} · {resume.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-accent">{resume.score}%</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/builder")}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Profile Completion */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Profile Completion</h2>
          <Card className="shadow-card">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{Math.round(profileProgress)}% Complete</span>
                <span className="text-xs text-muted-foreground">{completedTasks}/{profileTasks.length}</span>
              </div>
              <Progress value={profileProgress} className="h-2" />
              <div className="space-y-2">
                {profileTasks.map((task) => (
                  <div key={task.label} className="flex items-center gap-2 text-sm">
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${task.completed ? "bg-accent border-accent" : "border-muted-foreground"}`}>
                      {task.completed && <span className="text-accent-foreground text-[10px]">✓</span>}
                    </div>
                    <span className={task.completed ? "text-muted-foreground line-through" : "text-foreground"}>
                      {task.label}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate("/profile")}>
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
