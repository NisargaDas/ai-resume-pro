import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Sparkles,
  Download,
  Save,
  GripVertical,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Languages,
  Trophy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  bullets: string[];
}

interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

export default function ResumeBuilderPage() {
  const { toast } = useToast();
  const [resumeTitle, setResumeTitle] = useState("Software Engineer Resume");
  const [summary, setSummary] = useState(
    "Experienced software engineer with 5+ years building scalable web applications. Proficient in React, TypeScript, and Node.js."
  );
  const [skills, setSkills] = useState(["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "AWS"]);
  const [newSkill, setNewSkill] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: "1",
      company: "TechCorp Inc.",
      role: "Senior Software Engineer",
      period: "2022 - Present",
      bullets: [
        "Led development of a React-based dashboard serving 50K+ users",
        "Reduced API response times by 40% through query optimization",
      ],
    },
    {
      id: "2",
      company: "StartupXYZ",
      role: "Software Engineer",
      period: "2020 - 2022",
      bullets: [
        "Built RESTful APIs using Node.js and Express",
        "Implemented CI/CD pipelines reducing deployment time by 60%",
      ],
    },
  ]);
  const [educations, setEducations] = useState<Education[]>([
    { id: "1", school: "MIT", degree: "B.S. Computer Science", year: "2020" },
  ]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const handleSave = () => toast({ title: "Resume saved", description: "Your resume has been saved successfully." });
  const handleAI = () =>
    toast({ title: "AI Enhancement", description: "AI suggestions applied to your resume." });

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-6 max-w-[1600px] mx-auto">
      {/* Editor Panel */}
      <div className="flex-1 overflow-auto space-y-4 pr-2">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Resume Builder</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> PDF
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleAI}>
              <Sparkles className="h-4 w-4 mr-1" /> AI Improve
            </Button>
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted p-1">
            <TabsTrigger value="summary" className="text-xs"><User className="h-3 w-3 mr-1" />Summary</TabsTrigger>
            <TabsTrigger value="skills" className="text-xs"><Code className="h-3 w-3 mr-1" />Skills</TabsTrigger>
            <TabsTrigger value="experience" className="text-xs"><Briefcase className="h-3 w-3 mr-1" />Experience</TabsTrigger>
            <TabsTrigger value="education" className="text-xs"><GraduationCap className="h-3 w-3 mr-1" />Education</TabsTrigger>
            <TabsTrigger value="projects" className="text-xs"><Code className="h-3 w-3 mr-1" />Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Resume Title</Label>
              <Input value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Professional Summary</Label>
                <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={handleAI}>
                  <Sparkles className="h-3 w-3 mr-1" /> AI Generate
                </Button>
              </div>
              <Textarea
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a professional summary..."
              />
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
              />
              <Button onClick={addSkill} size="sm"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm gap-1">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="experience" className="space-y-4 mt-4">
            {experiences.map((exp) => (
              <Card key={exp.id} className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Company</Label>
                      <Input value={exp.company} readOnly className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Role</Label>
                      <Input value={exp.role} readOnly className="h-8 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Period</Label>
                    <Input value={exp.period} readOnly className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Key Achievements</Label>
                    {exp.bullets.map((b, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-muted-foreground mt-1">•</span>
                        <p className="text-sm text-foreground">{b}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Experience
            </Button>
          </TabsContent>

          <TabsContent value="education" className="space-y-4 mt-4">
            {educations.map((edu) => (
              <Card key={edu.id} className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">School</Label>
                      <Input value={edu.school} readOnly className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Degree</Label>
                      <Input value={edu.degree} readOnly className="h-8 text-sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Education
            </Button>
          </TabsContent>

          <TabsContent value="projects" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Code className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No projects added yet</p>
              <Button variant="outline" size="sm" className="mt-3">
                <Plus className="h-4 w-4 mr-1" /> Add Project
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Live Preview Panel */}
      <div className="hidden lg:block w-[480px] shrink-0">
        <Card className="shadow-elevated h-full overflow-auto">
          <CardContent className="p-8">
            <div className="space-y-5">
              <div className="text-center border-b border-border pb-4">
                <h2 className="font-display text-xl font-bold text-foreground">John Doe</h2>
                <p className="text-sm text-muted-foreground">Senior Software Engineer</p>
                <p className="text-xs text-muted-foreground mt-1">john@example.com · San Francisco, CA</p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Summary</h3>
                <p className="text-xs text-foreground leading-relaxed">{summary}</p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {skills.map((skill) => (
                    <span key={skill} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Experience</h3>
                {experiences.map((exp) => (
                  <div key={exp.id} className="mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{exp.role}</p>
                        <p className="text-[10px] text-muted-foreground">{exp.company}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{exp.period}</span>
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="text-[10px] text-foreground pl-2 relative before:content-['•'] before:absolute before:left-0 before:text-muted-foreground">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Education</h3>
                {educations.map((edu) => (
                  <div key={edu.id} className="flex justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{edu.degree}</p>
                      <p className="text-[10px] text-muted-foreground">{edu.school}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{edu.year}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
