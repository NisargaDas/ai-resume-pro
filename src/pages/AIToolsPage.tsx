import { useState } from "react";
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

export default function AIToolsPage() {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [showATSResult, setShowATSResult] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  const missingKeywords = ["Python", "Docker", "REST API", "Agile", "CI/CD"];
  const suggestions = [
    "Add measurable achievements to bullet points",
    "Include more technical skills relevant to the role",
    "Quantify your impact with metrics and percentages",
    "Use stronger action verbs at the start of bullet points",
  ];

  const matchedJobs = [
    { role: "Software Developer", match: 92, skills: ["React", "TypeScript", "Node.js"] },
    { role: "Data Analyst", match: 78, skills: ["Python", "SQL", "Analytics"] },
    { role: "Backend Engineer", match: 85, skills: ["Node.js", "PostgreSQL", "AWS"] },
    { role: "Full Stack Developer", match: 88, skills: ["React", "Node.js", "TypeScript"] },
  ];

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

        {/* ATS Score Checker */}
        <TabsContent value="ats" className="space-y-4 mt-4">
          <Card className="shadow-card">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <Label>Paste Job Description</Label>
                <Textarea
                  rows={4}
                  placeholder="Paste the job description here to analyze your resume..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={() => { setShowATSResult(true); toast({ title: "Analysis complete!" }); }}
              >
                <Target className="h-4 w-4 mr-2" /> Analyze Resume
              </Button>
            </CardContent>
          </Card>

          {showATSResult && (
            <div className="space-y-4">
              <Card className="shadow-card border-l-4 border-l-accent">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold">ATS Score</h3>
                    <span className="font-display text-3xl font-bold text-accent">76%</span>
                  </div>
                  <Progress value={76} className="h-3 mb-2" />
                  <p className="text-xs text-muted-foreground">Your resume matches 76% of the job requirements</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-5">
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-chart-3" /> Missing Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {missingKeywords.map((kw) => (
                      <Badge key={kw} variant="outline" className="border-destructive text-destructive">{kw}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-5">
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" /> Optimization Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Cover Letter Generator */}
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
                <Label>Job Description</Label>
                <Textarea rows={3} placeholder="Paste the job description..." />
              </div>
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={() => { setShowCoverLetter(true); toast({ title: "Cover letter generated!" }); }}
              >
                <Sparkles className="h-4 w-4 mr-2" /> Generate Cover Letter
              </Button>
            </CardContent>
          </Card>

          {showCoverLetter && (
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none text-foreground space-y-3">
                  <p>Dear Hiring Manager,</p>
                  <p>
                    I am writing to express my interest in the {jobRole || "Software Engineer"} position at{" "}
                    {companyName || "your company"}. With over 5 years of experience in software development and a proven
                    track record of building scalable applications, I am confident in my ability to contribute to your team.
                  </p>
                  <p>
                    In my current role at TechCorp Inc., I led the development of a React-based dashboard serving over
                    50,000 users, and reduced API response times by 40% through query optimization. These experiences have
                    honed my skills in full-stack development and team leadership.
                  </p>
                  <p>
                    I am particularly excited about this opportunity because of {companyName || "your company"}'s commitment
                    to innovation and its impact on the industry. I look forward to the possibility of contributing my
                    expertise to your team.
                  </p>
                  <p>Best regards,<br />John Doe</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Job Match */}
        <TabsContent value="jobs" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Based on your profile and skills, here are your best job matches:</p>
          {matchedJobs.map((job) => (
            <Card key={job.role} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{job.role}</p>
                    <div className="flex gap-1 mt-1">
                      {job.skills.map((s) => (
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
