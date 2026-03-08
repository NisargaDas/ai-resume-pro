import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Target, FileText, Briefcase, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { callAI, parseAIJson } from "@/lib/ai";

export default function AIToolsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [atsResult, setAtsResult] = useState<{ score: number; missingKeywords: string[]; suggestions: string[] } | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("resumes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
    ]).then(([{ data: p }, { data: r }]) => {
      setProfile(p);
      setResumes(r || []);
    });
  }, [user]);

  const latestResume = resumes[0];

  const handleATS = async () => {
    if (!jobDescription) { toast({ title: "Paste a job description first", variant: "destructive" }); return; }
    if (!latestResume) { toast({ title: "Create a resume first", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const raw = await callAI("ats-score", {
        title: latestResume.title,
        summary: latestResume.summary,
        skills: latestResume.skills,
        experiences: latestResume.experiences,
        jobDescription,
      });
      const result = parseAIJson<{ score: number; missingKeywords: string[]; suggestions: string[] }>(raw);
      setAtsResult(result);

      // Save ATS score to resume
      await supabase.from("resumes").update({ ats_score: result.score, job_description: jobDescription }).eq("id", latestResume.id);
      toast({ title: "Analysis complete!" });
    } catch (e: any) {
      toast({ title: "AI Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleCoverLetter = async () => {
    if (!companyName || !jobRole) { toast({ title: "Fill in company and role", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const result = await callAI("cover-letter", {
        companyName,
        jobRole,
        jobDescription,
        name: profile?.full_name || "Candidate",
        skills: profile?.skills || [],
        summary: latestResume?.summary || "",
      });
      setCoverLetter(result);

      // Save to database
      await supabase.from("cover_letters").insert({
        user_id: user!.id,
        company_name: companyName,
        job_role: jobRole,
        job_description: jobDescription,
        content: result,
      });
      toast({ title: "Cover letter generated!" });
    } catch (e: any) {
      toast({ title: "AI Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleJobMatch = async () => {
    if (!profile?.skills?.length) { toast({ title: "Add skills to your profile first", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const raw = await callAI("job-match", {
        skills: profile.skills,
        summary: latestResume?.summary || profile.headline || "",
      });
      const matches = parseAIJson<any[]>(raw);
      setJobMatches(matches);
      toast({ title: "Job matches found!" });
    } catch (e: any) {
      toast({ title: "AI Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">AI Tools</h1>
        <p className="text-muted-foreground mt-1">Optimize your resume with AI-powered tools</p>
      </div>

      <Tabs defaultValue="ats" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="ats"><Target className="h-4 w-4 mr-1" />ATS Checker</TabsTrigger>
          <TabsTrigger value="cover"><FileText className="h-4 w-4 mr-1" />Cover Letter</TabsTrigger>
          <TabsTrigger value="jobs"><Briefcase className="h-4 w-4 mr-1" />Job Match</TabsTrigger>
        </TabsList>

        <TabsContent value="ats" className="space-y-4 mt-4">
          <Card className="shadow-card">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <Label>Paste Job Description</Label>
                <Textarea rows={4} placeholder="Paste the job description here to analyze your latest resume..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
              </div>
              {!latestResume && <p className="text-xs text-muted-foreground">⚠️ Create a resume first to use the ATS checker</p>}
              <Button className="gradient-primary text-primary-foreground" onClick={handleATS} disabled={loading || !latestResume}>
                <Target className="h-4 w-4 mr-2" /> {loading ? "Analyzing..." : "Analyze Resume"}
              </Button>
            </CardContent>
          </Card>

          {atsResult && (
            <div className="space-y-4">
              <Card className="shadow-card border-l-4 border-l-accent">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold">ATS Score</h3>
                    <span className="font-display text-3xl font-bold text-accent">{atsResult.score}%</span>
                  </div>
                  <Progress value={atsResult.score} className="h-3 mb-2" />
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <h3 className="font-display font-semibold flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-chart-3" /> Missing Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {atsResult.missingKeywords.map((kw) => (
                      <Badge key={kw} variant="outline" className="border-destructive text-destructive">{kw}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <h3 className="font-display font-semibold flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" /> Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {atsResult.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" /> {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cover" className="space-y-4 mt-4">
          <Card className="shadow-card">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input placeholder="e.g., Google" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Job Role</Label>
                  <Input placeholder="e.g., Software Engineer" value={jobRole} onChange={(e) => setJobRole(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Job Description (optional)</Label>
                <Textarea rows={3} placeholder="Paste the job description..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
              </div>
              <Button className="gradient-primary text-primary-foreground" onClick={handleCoverLetter} disabled={loading}>
                <Sparkles className="h-4 w-4 mr-2" /> {loading ? "Generating..." : "Generate Cover Letter"}
              </Button>
            </CardContent>
          </Card>

          {coverLetter && (
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{coverLetter}</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4 mt-4">
          <Button className="gradient-primary text-primary-foreground" onClick={handleJobMatch} disabled={loading}>
            <Briefcase className="h-4 w-4 mr-2" /> {loading ? "Finding matches..." : "Find Job Matches"}
          </Button>
          {jobMatches.length > 0 && jobMatches.map((job, i) => (
            <Card key={i} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{job.role}</p>
                    <div className="flex gap-1 mt-1">
                      {(job.requiredSkills || []).slice(0, 3).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-display font-bold text-accent text-lg">{job.match}%</span>
                  <p className="text-[10px] text-muted-foreground">match</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
