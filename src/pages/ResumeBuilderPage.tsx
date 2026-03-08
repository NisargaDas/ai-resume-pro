import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Sparkles, Download, Save, User, Briefcase, GraduationCap, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { callAI, parseAIJson } from "@/lib/ai";

interface Experience {
  company: string;
  role: string;
  period: string;
  bullets: string[];
}

interface Education {
  school: string;
  degree: string;
  year: string;
}

export default function ResumeBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(id || null);
  const [resumeTitle, setResumeTitle] = useState("Untitled Resume");
  const [template, setTemplate] = useState("modern");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id && user) {
      supabase.from("resumes").select("*").eq("id", id).eq("user_id", user.id).single().then(({ data }) => {
        if (data) {
          setResumeTitle(data.title);
          setTemplate(data.template);
          setSummary(data.summary || "");
          setSkills(data.skills || []);
          setJobDescription(data.job_description || "");
          setExperiences((data.experiences as unknown as Experience[]) || []);
          setEducations((data.educations as unknown as Education[]) || []);
          setResumeId(data.id);
        }
        setLoading(false);
      });
    }
  }, [id, user]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => setSkills(skills.filter(s => s !== skill));

  const addExperience = () => {
    setExperiences([...experiences, { company: "", role: "", period: "", bullets: [""] }]);
  };

  const updateExperience = (idx: number, field: keyof Experience, value: string | string[]) => {
    setExperiences(experiences.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const addEducation = () => {
    setEducations([...educations, { school: "", degree: "", year: "" }]);
  };

  const updateEducation = (idx: number, field: keyof Education, value: string) => {
    setEducations(educations.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const resumeData = {
      user_id: user.id,
      title: resumeTitle,
      template,
      summary,
      skills,
      job_description: jobDescription,
      experiences: JSON.parse(JSON.stringify(experiences)),
      educations: JSON.parse(JSON.stringify(educations)),
    };

    if (resumeId) {
      const { error } = await supabase.from("resumes").update(resumeData).eq("id", resumeId);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Resume saved!" });
    } else {
      const { data, error } = await supabase.from("resumes").insert(resumeData).select("id").single();
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else {
        setResumeId(data.id);
        toast({ title: "Resume created!" });
        navigate(`/builder/${data.id}`, { replace: true });
      }
    }
    setSaving(false);
  };

  const handleAISummary = async () => {
    if (!summary && !jobDescription) { toast({ title: "Add a summary or job description first", variant: "destructive" }); return; }
    setAiLoading(true);
    try {
      const result = await callAI("improve-summary", { summary: summary || "Write a professional summary", jobDescription });
      setSummary(result);
      toast({ title: "Summary improved by AI!" });
    } catch (e: any) {
      toast({ title: "AI Error", description: e.message, variant: "destructive" });
    }
    setAiLoading(false);
  };

  const handleAISuggestSkills = async () => {
    if (!jobDescription) { toast({ title: "Add a job description first", variant: "destructive" }); return; }
    setAiLoading(true);
    try {
      const result = await callAI("suggest-skills", { jobDescription });
      const suggested = parseAIJson<string[]>(result);
      const newSkills = suggested.filter(s => !skills.includes(s));
      setSkills([...skills, ...newSkills]);
      toast({ title: `Added ${newSkills.length} skills!` });
    } catch (e: any) {
      toast({ title: "AI Error", description: e.message, variant: "destructive" });
    }
    setAiLoading(false);
  };

  const profile = user?.user_metadata;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-6 max-w-[1600px] mx-auto">
      {/* Editor Panel */}
      <div className="flex-1 overflow-auto space-y-4 pr-2">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Resume Builder</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleAISummary} disabled={aiLoading}>
              <Sparkles className="h-4 w-4 mr-1" /> {aiLoading ? "Working..." : "AI Improve"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted p-1">
            <TabsTrigger value="summary" className="text-xs"><User className="h-3 w-3 mr-1" />Summary</TabsTrigger>
            <TabsTrigger value="skills" className="text-xs"><Code className="h-3 w-3 mr-1" />Skills</TabsTrigger>
            <TabsTrigger value="experience" className="text-xs"><Briefcase className="h-3 w-3 mr-1" />Experience</TabsTrigger>
            <TabsTrigger value="education" className="text-xs"><GraduationCap className="h-3 w-3 mr-1" />Education</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Resume Title</Label>
              <Input value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Job Description (optional, for AI optimization)</Label>
              <Textarea rows={3} placeholder="Paste the target job description..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Professional Summary</Label>
                <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={handleAISummary} disabled={aiLoading}>
                  <Sparkles className="h-3 w-3 mr-1" /> AI Generate
                </Button>
              </div>
              <Textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Write a professional summary..." />
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input placeholder="Add a skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} />
              <Button onClick={addSkill} size="sm"><Plus className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={handleAISuggestSkills} disabled={aiLoading}>
                <Sparkles className="h-4 w-4 mr-1" /> Suggest
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm gap-1">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="experience" className="space-y-4 mt-4">
            {experiences.map((exp, idx) => (
              <Card key={idx} className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Company</Label>
                      <Input value={exp.company} onChange={(e) => updateExperience(idx, "company", e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Role</Label>
                      <Input value={exp.role} onChange={(e) => updateExperience(idx, "role", e.target.value)} className="h-8 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Period</Label>
                    <Input value={exp.period} onChange={(e) => updateExperience(idx, "period", e.target.value)} className="h-8 text-sm" placeholder="e.g., 2022 - Present" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Key Achievements (one per line)</Label>
                    <Textarea rows={3} value={exp.bullets.join("\n")} onChange={(e) => updateExperience(idx, "bullets", e.target.value.split("\n"))} className="text-sm" />
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}>
                    <Trash2 className="h-3 w-3 mr-1" /> Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={addExperience}><Plus className="h-4 w-4 mr-2" /> Add Experience</Button>
          </TabsContent>

          <TabsContent value="education" className="space-y-4 mt-4">
            {educations.map((edu, idx) => (
              <Card key={idx} className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">School</Label>
                      <Input value={edu.school} onChange={(e) => updateEducation(idx, "school", e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Degree</Label>
                      <Input value={edu.degree} onChange={(e) => updateEducation(idx, "degree", e.target.value)} className="h-8 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Year</Label>
                    <Input value={edu.year} onChange={(e) => updateEducation(idx, "year", e.target.value)} className="h-8 text-sm" />
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => setEducations(educations.filter((_, i) => i !== idx))}>
                    <Trash2 className="h-3 w-3 mr-1" /> Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={addEducation}><Plus className="h-4 w-4 mr-2" /> Add Education</Button>
          </TabsContent>
        </Tabs>
      </div>

      {/* Live Preview Panel */}
      <div className="hidden lg:block w-[480px] shrink-0">
        <Card className="shadow-elevated h-full overflow-auto">
          <CardContent className="p-8">
            <div className="space-y-5">
              <div className="text-center border-b border-border pb-4">
                <h2 className="font-display text-xl font-bold text-foreground">{profile?.full_name || "Your Name"}</h2>
                <p className="text-sm text-muted-foreground">{resumeTitle}</p>
                <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
              </div>

              {summary && (
                <div>
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Summary</h3>
                  <p className="text-xs text-foreground leading-relaxed">{summary}</p>
                </div>
              )}

              {skills.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((skill) => (
                      <span key={skill} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {experiences.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Experience</h3>
                  {experiences.map((exp, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold text-foreground">{exp.role || "Role"}</p>
                          <p className="text-[10px] text-muted-foreground">{exp.company || "Company"}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{exp.period}</span>
                      </div>
                      <ul className="mt-1 space-y-0.5">
                        {exp.bullets.filter(b => b.trim()).map((b, j) => (
                          <li key={j} className="text-[10px] text-foreground pl-2 relative before:content-['•'] before:absolute before:left-0 before:text-muted-foreground">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {educations.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Education</h3>
                  {educations.map((edu, i) => (
                    <div key={i} className="flex justify-between mb-2">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{edu.degree || "Degree"}</p>
                        <p className="text-[10px] text-muted-foreground">{edu.school || "School"}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{edu.year}</span>
                    </div>
                  ))}
                </div>
              )}

              {!summary && skills.length === 0 && experiences.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Start filling in the editor to see your resume preview</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
