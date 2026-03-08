import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus, Trash2, Sparkles, Download, Save, User, Briefcase,
  GraduationCap, Code, Award, Languages as LanguagesIcon, Trophy, GripVertical, FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { callAI, parseAIJson } from "@/lib/ai";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ResumePreview } from "@/components/resume/ResumePreview";
import {
  Experience, Education, Project, Certification, Language, Achievement, PersonalDetails, Internship, Hobby,
  ResumeSection, DEFAULT_SECTIONS, generateId, downloadResumePDF, downloadResumeWord,
} from "@/lib/resume-types";

// ── Sortable wrapper ──
function SortableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }} className="relative group">
      <button {...attributes} {...listeners} className="absolute -left-5 top-3 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity z-10" type="button">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      {children}
    </div>
  );
}

// ── Sortable section tab ──
function SortableSectionTab({ section, isActive, onClick }: { section: ResumeSection; isActive: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs cursor-pointer mb-0.5 transition-colors ${
        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted"
      }`}
      onClick={onClick}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing shrink-0" type="button" onClick={e => e.stopPropagation()}>
        <GripVertical className="h-3 w-3" />
      </button>
      {SECTION_ICONS[section.type]}
      <span className="truncate">{section.label}</span>
    </div>
  );
}

// ── Section icons ──
const SECTION_ICONS: Record<string, React.ReactNode> = {
  personal: <User className="h-3.5 w-3.5" />,
  summary: <User className="h-3.5 w-3.5" />,
  objective: <FileText className="h-3.5 w-3.5" />,
  profile: <User className="h-3.5 w-3.5" />,
  skills: <Code className="h-3.5 w-3.5" />,
  experience: <Briefcase className="h-3.5 w-3.5" />,
  internship: <Briefcase className="h-3.5 w-3.5" />,
  education: <GraduationCap className="h-3.5 w-3.5" />,
  projects: <Code className="h-3.5 w-3.5" />,
  certifications: <Award className="h-3.5 w-3.5" />,
  languages: <LanguagesIcon className="h-3.5 w-3.5" />,
  achievements: <Trophy className="h-3.5 w-3.5" />,
  hobbies: <Trophy className="h-3.5 w-3.5" />,
};

export default function ResumeBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const previewRef = useRef<HTMLDivElement>(null);

  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(id || null);
  const [resumeTitle, setResumeTitle] = useState("Untitled Resume");
  const [template, setTemplate] = useState("modern");
  const [summary, setSummary] = useState("");
  const [objective, setObjective] = useState("");
  const [profileSummary, setProfileSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({ phone: "", gender: "", dob: "", linkedin: "", portfolio: "" });
  const [sections, setSections] = useState<ResumeSection[]>(DEFAULT_SECTIONS);
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [loading, setLoading] = useState(!!id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (id && user) {
      supabase.from("resumes").select("*").eq("id", id).eq("user_id", user.id).single().then(({ data }) => {
        if (data) {
          setResumeTitle(data.title);
          setTemplate(data.template);
          setSummary(data.summary || "");
          setObjective((data as any).objective || "");
          setProfileSummary((data as any).profile_summary || "");
          setSkills(data.skills || []);
          setJobDescription(data.job_description || "");
          setExperiences((data.experiences as unknown as Experience[]) || []);
          setInternships(((data as any).internships as unknown as Internship[]) || []);
          setEducations((data.educations as unknown as Education[]) || []);
          setProjects((data.projects as unknown as Project[]) || []);
          setCertifications((data.certifications as unknown as Certification[]) || []);
          setLanguages((data.languages as unknown as Language[]) || []);
          setAchievements((data.achievements as unknown as Achievement[]) || []);
          setHobbies(((data as any).hobbies as unknown as Hobby[]) || []);
          setPersonalDetails((data.personal_details as unknown as PersonalDetails) || { phone: "", gender: "", dob: "", linkedin: "", portfolio: "" });
          setResumeId(data.id);
        }
        setLoading(false);
      });
    }
  }, [id, user]);

  // ── Auto-save (debounced) ──
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!user || !resumeId || loading) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      const data = {
        user_id: user.id, title: resumeTitle, template, summary, skills,
        job_description: jobDescription,
        objective, profile_summary: profileSummary,
        experiences: JSON.parse(JSON.stringify(experiences)),
        internships: JSON.parse(JSON.stringify(internships)),
        educations: JSON.parse(JSON.stringify(educations)),
        projects: JSON.parse(JSON.stringify(projects)),
        certifications: JSON.parse(JSON.stringify(certifications)),
        languages: JSON.parse(JSON.stringify(languages)),
        achievements: JSON.parse(JSON.stringify(achievements)),
        hobbies: JSON.parse(JSON.stringify(hobbies)),
        personal_details: JSON.parse(JSON.stringify(personalDetails)),
      };
      await supabase.from("resumes").update(data).eq("id", resumeId);
    }, 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [resumeTitle, template, summary, objective, profileSummary, skills, jobDescription, experiences, internships, educations, projects, certifications, languages, achievements, hobbies, personalDetails, resumeId, user, loading]);

  // ── CRUD helpers ──
  const addSkill = () => { if (newSkill.trim() && !skills.includes(newSkill.trim())) { setSkills([...skills, newSkill.trim()]); setNewSkill(""); } };
  const removeSkill = (s: string) => setSkills(skills.filter(x => x !== s));

  const addExperience = () => setExperiences([...experiences, { id: generateId(), company: "", role: "", period: "", bullets: [""] }]);
  const updateExp = (idx: number, field: string, value: any) => setExperiences(experiences.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  const removeExp = (idx: number) => setExperiences(experiences.filter((_, i) => i !== idx));

  const addInternship = () => setInternships([...internships, { id: generateId(), company: "", role: "", period: "", bullets: [""] }]);
  const updateIntern = (idx: number, field: string, value: any) => setInternships(internships.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  const removeIntern = (idx: number) => setInternships(internships.filter((_, i) => i !== idx));

  const addEducation = () => setEducations([...educations, { id: generateId(), school: "", degree: "", year: "", grade: "", distinction: "" }]);
  const updateEdu = (idx: number, field: string, value: string) => setEducations(educations.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  const removeEdu = (idx: number) => setEducations(educations.filter((_, i) => i !== idx));

  const addProject = () => setProjects([...projects, { id: generateId(), name: "", description: "", technologies: "", link: "" }]);
  const updateProj = (idx: number, field: string, value: string) => setProjects(projects.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  const removeProj = (idx: number) => setProjects(projects.filter((_, i) => i !== idx));

  const addCert = () => setCertifications([...certifications, { id: generateId(), name: "", issuer: "", year: "" }]);
  const updateCert = (idx: number, field: string, value: string) => setCertifications(certifications.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  const removeCert = (idx: number) => setCertifications(certifications.filter((_, i) => i !== idx));

  const addLang = () => setLanguages([...languages, { id: generateId(), name: "", level: "Intermediate" }]);
  const updateLang = (idx: number, field: string, value: string) => setLanguages(languages.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  const removeLang = (idx: number) => setLanguages(languages.filter((_, i) => i !== idx));

  const addAch = () => setAchievements([...achievements, { id: generateId(), text: "" }]);
  const updateAch = (idx: number, value: string) => setAchievements(achievements.map((a, i) => i === idx ? { ...a, text: value } : a));
  const removeAch = (idx: number) => setAchievements(achievements.filter((_, i) => i !== idx));

  const addHobby = () => setHobbies([...hobbies, { id: generateId(), name: "" }]);
  const updateHobby = (idx: number, value: string) => setHobbies(hobbies.map((h, i) => i === idx ? { ...h, name: value } : h));
  const removeHobby = (idx: number) => setHobbies(hobbies.filter((_, i) => i !== idx));

  // ── DnD for experiences ──
  const handleExpDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIdx = experiences.findIndex(x => x.id === active.id);
      const newIdx = experiences.findIndex(x => x.id === over.id);
      setExperiences(arrayMove(experiences, oldIdx, newIdx));
    }
  };

  const handleEduDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIdx = educations.findIndex(x => x.id === active.id);
      const newIdx = educations.findIndex(x => x.id === over.id);
      setEducations(arrayMove(educations, oldIdx, newIdx));
    }
  };

  const handleInternDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setInternships(arrayMove(internships, internships.findIndex(x => x.id === active.id), internships.findIndex(x => x.id === over.id)));
    }
  };

  const handleProjDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setProjects(arrayMove(projects, projects.findIndex(x => x.id === active.id), projects.findIndex(x => x.id === over.id)));
    }
  };

  const handleSectionDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setSections(arrayMove(sections, sections.findIndex(s => s.id === active.id), sections.findIndex(s => s.id === over.id)));
    }
  };

  // ── Save ──
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const data = {
      user_id: user.id, title: resumeTitle, template, summary, skills,
      job_description: jobDescription,
      objective, profile_summary: profileSummary,
      experiences: JSON.parse(JSON.stringify(experiences)),
      internships: JSON.parse(JSON.stringify(internships)),
      educations: JSON.parse(JSON.stringify(educations)),
      projects: JSON.parse(JSON.stringify(projects)),
      certifications: JSON.parse(JSON.stringify(certifications)),
      languages: JSON.parse(JSON.stringify(languages)),
      achievements: JSON.parse(JSON.stringify(achievements)),
      hobbies: JSON.parse(JSON.stringify(hobbies)),
      personal_details: JSON.parse(JSON.stringify(personalDetails)),
    };
    if (resumeId) {
      const { error } = await supabase.from("resumes").update(data).eq("id", resumeId);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Resume saved!" });
    } else {
      const { data: res, error } = await supabase.from("resumes").insert(data).select("id").single();
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else { setResumeId(res.id); toast({ title: "Resume created!" }); navigate(`/builder/${res.id}`, { replace: true }); }
    }
    setSaving(false);
  };

  // ── PDF ──
  const handlePDF = async () => {
    if (!previewRef.current) return;
    toast({ title: "Generating PDF..." });
    try {
      await downloadResumePDF(previewRef.current, resumeTitle);
      toast({ title: "PDF downloaded!" });
      // Increment download count
      if (resumeId) await supabase.from("resumes").update({ downloads: (await supabase.from("resumes").select("downloads").eq("id", resumeId).single()).data?.downloads! + 1 }).eq("id", resumeId);
    } catch (e: any) {
      toast({ title: "PDF Error", description: e.message, variant: "destructive" });
    }
  };

  // ── Word ──
  const handleWord = async () => {
    toast({ title: "Generating Word document..." });
    try {
      await downloadResumeWord({
        name: profile?.full_name || "",
        email: user?.email || "",
        personalDetails, objective, profileSummary,
        summary, skills, experiences, internships, educations, projects,
        certifications, languages, achievements, hobbies, sections,
      }, resumeTitle);
      toast({ title: "Word document downloaded!" });
      if (resumeId) await supabase.from("resumes").update({ downloads: (await supabase.from("resumes").select("downloads").eq("id", resumeId).single()).data?.downloads! + 1 }).eq("id", resumeId);
    } catch (e: any) {
      toast({ title: "Word Error", description: e.message, variant: "destructive" });
    }
  };
  const handleAISummary = async () => {
    setAiLoading(true);
    try {
      const result = await callAI("improve-summary", { summary: summary || "Write a professional summary", jobDescription });
      setSummary(result);
      toast({ title: "Summary improved!" });
    } catch (e: any) { toast({ title: "AI Error", description: e.message, variant: "destructive" }); }
    setAiLoading(false);
  };

  const handleAISuggestSkills = async () => {
    if (!jobDescription) { toast({ title: "Add a job description first", variant: "destructive" }); return; }
    setAiLoading(true);
    try {
      const result = await callAI("suggest-skills", { jobDescription });
      const suggested = parseAIJson<string[]>(result);
      setSkills([...skills, ...suggested.filter(s => !skills.includes(s))]);
      toast({ title: "Skills suggested!" });
    } catch (e: any) { toast({ title: "AI Error", description: e.message, variant: "destructive" }); }
    setAiLoading(false);
  };

  const profile = user?.user_metadata;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  // ── Section editor renderers ──
  const renderSectionEditor = () => {
    switch (activeSection) {
      case "personal":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={personalDetails.phone} onChange={e => setPersonalDetails({ ...personalDetails, phone: e.target.value })} placeholder="+91 7019641441" />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input value={personalDetails.dob} onChange={e => setPersonalDetails({ ...personalDetails, dob: e.target.value })} placeholder="e.g., 08/06/2004" />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Input value={personalDetails.gender} onChange={e => setPersonalDetails({ ...personalDetails, gender: e.target.value })} placeholder="e.g., Male, Female, Non-binary" />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input value={personalDetails.linkedin} onChange={e => setPersonalDetails({ ...personalDetails, linkedin: e.target.value })} placeholder="https://linkedin.com/in/yourname" />
            </div>
            <div className="space-y-2">
              <Label>Portfolio</Label>
              <Input value={personalDetails.portfolio} onChange={e => setPersonalDetails({ ...personalDetails, portfolio: e.target.value })} placeholder="https://yourportfolio.com" />
            </div>
          </div>
        );

      case "objective":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Career Objective</Label>
              <Textarea rows={4} value={objective} onChange={e => setObjective(e.target.value)} placeholder="Write your career objective..." />
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Description</Label>
              <Textarea rows={5} value={profileSummary} onChange={e => setProfileSummary(e.target.value)} placeholder="Write a detailed profile description..." />
            </div>
          </div>
        );

      case "summary":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Resume Title</Label>
              <Input value={resumeTitle} onChange={e => setResumeTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Job Description (for AI optimization)</Label>
              <Textarea rows={3} placeholder="Paste the target job description..." value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Professional Summary</Label>
                <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={handleAISummary} disabled={aiLoading}>
                  <Sparkles className="h-3 w-3 mr-1" /> AI Generate
                </Button>
              </div>
              <Textarea rows={4} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Write a professional summary..." />
            </div>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Add a skill..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} />
              <Button onClick={addSkill} size="sm"><Plus className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={handleAISuggestSkills} disabled={aiLoading}>
                <Sparkles className="h-4 w-4 mr-1" /> Suggest
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm gap-1">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </Badge>
              ))}
              {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet</p>}
            </div>
          </div>
        );

      case "experience":
        return (
          <div className="space-y-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleExpDragEnd}>
              <SortableContext items={experiences.map(e => e.id)} strategy={verticalListSortingStrategy}>
                {experiences.map((exp, idx) => (
                  <SortableCard key={exp.id} id={exp.id}>
                    <Card className="shadow-card ml-2">
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1"><Label className="text-xs">Company</Label><Input value={exp.company} onChange={e => updateExp(idx, "company", e.target.value)} className="h-8 text-sm" /></div>
                          <div className="space-y-1"><Label className="text-xs">Role</Label><Input value={exp.role} onChange={e => updateExp(idx, "role", e.target.value)} className="h-8 text-sm" /></div>
                        </div>
                        <div className="space-y-1"><Label className="text-xs">Period</Label><Input value={exp.period} onChange={e => updateExp(idx, "period", e.target.value)} className="h-8 text-sm" placeholder="e.g., 2022 - Present" /></div>
                        <div className="space-y-1">
                          <Label className="text-xs">Achievements (one per line)</Label>
                          <Textarea rows={3} value={exp.bullets.join("\n")} onChange={e => updateExp(idx, "bullets", e.target.value.split("\n"))} className="text-sm" />
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => removeExp(idx)}><Trash2 className="h-3 w-3 mr-1" /> Remove</Button>
                      </CardContent>
                    </Card>
                  </SortableCard>
                ))}
              </SortableContext>
            </DndContext>
            <Button variant="outline" className="w-full" onClick={addExperience}><Plus className="h-4 w-4 mr-2" /> Add Experience</Button>
          </div>
        );

      case "internship":
        return (
          <div className="space-y-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleInternDragEnd}>
              <SortableContext items={internships.map(e => e.id)} strategy={verticalListSortingStrategy}>
                {internships.map((intern, idx) => (
                  <SortableCard key={intern.id} id={intern.id}>
                    <Card className="shadow-card ml-2">
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1"><Label className="text-xs">Company</Label><Input value={intern.company} onChange={e => updateIntern(idx, "company", e.target.value)} className="h-8 text-sm" /></div>
                          <div className="space-y-1"><Label className="text-xs">Role</Label><Input value={intern.role} onChange={e => updateIntern(idx, "role", e.target.value)} className="h-8 text-sm" /></div>
                        </div>
                        <div className="space-y-1"><Label className="text-xs">Period</Label><Input value={intern.period} onChange={e => updateIntern(idx, "period", e.target.value)} className="h-8 text-sm" placeholder="e.g., Feb 2026 - Present" /></div>
                        <div className="space-y-1">
                          <Label className="text-xs">Description (one per line)</Label>
                          <Textarea rows={3} value={intern.bullets.join("\n")} onChange={e => updateIntern(idx, "bullets", e.target.value.split("\n"))} className="text-sm" />
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => removeIntern(idx)}><Trash2 className="h-3 w-3 mr-1" /> Remove</Button>
                      </CardContent>
                    </Card>
                  </SortableCard>
                ))}
              </SortableContext>
            </DndContext>
            <Button variant="outline" className="w-full" onClick={addInternship}><Plus className="h-4 w-4 mr-2" /> Add Internship</Button>
          </div>
        );

      case "education":
        return (
          <div className="space-y-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEduDragEnd}>
              <SortableContext items={educations.map(e => e.id)} strategy={verticalListSortingStrategy}>
                {educations.map((edu, idx) => (
                  <SortableCard key={edu.id} id={edu.id}>
                    <Card className="shadow-card ml-2">
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1"><Label className="text-xs">School</Label><Input value={edu.school} onChange={e => updateEdu(idx, "school", e.target.value)} className="h-8 text-sm" /></div>
                          <div className="space-y-1"><Label className="text-xs">Degree</Label><Input value={edu.degree} onChange={e => updateEdu(idx, "degree", e.target.value)} className="h-8 text-sm" /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1"><Label className="text-xs">Year</Label><Input value={edu.year} onChange={e => updateEdu(idx, "year", e.target.value)} className="h-8 text-sm" placeholder="2022 – 2026" /></div>
                          <div className="space-y-1"><Label className="text-xs">Grade/CGPA</Label><Input value={edu.grade} onChange={e => updateEdu(idx, "grade", e.target.value)} className="h-8 text-sm" placeholder="CGPA: 8.54" /></div>
                          <div className="space-y-1"><Label className="text-xs">Distinction</Label><Input value={edu.distinction} onChange={e => updateEdu(idx, "distinction", e.target.value)} className="h-8 text-sm" placeholder="Honors" /></div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => removeEdu(idx)}><Trash2 className="h-3 w-3 mr-1" /> Remove</Button>
                      </CardContent>
                    </Card>
                  </SortableCard>
                ))}
              </SortableContext>
            </DndContext>
            <Button variant="outline" className="w-full" onClick={addEducation}><Plus className="h-4 w-4 mr-2" /> Add Education</Button>
          </div>
        );

      case "projects":
        return (
          <div className="space-y-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProjDragEnd}>
              <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                {projects.map((proj, idx) => (
                  <SortableCard key={proj.id} id={proj.id}>
                    <Card className="shadow-card ml-2">
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-1"><Label className="text-xs">Project Name</Label><Input value={proj.name} onChange={e => updateProj(idx, "name", e.target.value)} className="h-8 text-sm" /></div>
                        <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea rows={2} value={proj.description} onChange={e => updateProj(idx, "description", e.target.value)} className="text-sm" /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1"><Label className="text-xs">Technologies</Label><Input value={proj.technologies} onChange={e => updateProj(idx, "technologies", e.target.value)} className="h-8 text-sm" placeholder="React, Node.js" /></div>
                          <div className="space-y-1"><Label className="text-xs">Link</Label><Input value={proj.link} onChange={e => updateProj(idx, "link", e.target.value)} className="h-8 text-sm" placeholder="https://..." /></div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => removeProj(idx)}><Trash2 className="h-3 w-3 mr-1" /> Remove</Button>
                      </CardContent>
                    </Card>
                  </SortableCard>
                ))}
              </SortableContext>
            </DndContext>
            <Button variant="outline" className="w-full" onClick={addProject}><Plus className="h-4 w-4 mr-2" /> Add Project</Button>
          </div>
        );

      case "certifications":
        return (
          <div className="space-y-4">
            {certifications.map((cert, idx) => (
              <Card key={cert.id} className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1"><Label className="text-xs">Certification Name</Label><Input value={cert.name} onChange={e => updateCert(idx, "name", e.target.value)} className="h-8 text-sm" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Issuer</Label><Input value={cert.issuer} onChange={e => updateCert(idx, "issuer", e.target.value)} className="h-8 text-sm" /></div>
                    <div className="space-y-1"><Label className="text-xs">Year</Label><Input value={cert.year} onChange={e => updateCert(idx, "year", e.target.value)} className="h-8 text-sm" /></div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => removeCert(idx)}><Trash2 className="h-3 w-3 mr-1" /> Remove</Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={addCert}><Plus className="h-4 w-4 mr-2" /> Add Certification</Button>
          </div>
        );

      case "languages":
        return (
          <div className="space-y-4">
            {languages.map((lang, idx) => (
              <Card key={lang.id} className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Language</Label><Input value={lang.name} onChange={e => updateLang(idx, "name", e.target.value)} className="h-8 text-sm" /></div>
                    <div className="space-y-1"><Label className="text-xs">Proficiency</Label><Input value={lang.level} onChange={e => updateLang(idx, "level", e.target.value)} className="h-8 text-sm" placeholder="Native, Fluent, Intermediate" /></div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => removeLang(idx)}><Trash2 className="h-3 w-3 mr-1" /> Remove</Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={addLang}><Plus className="h-4 w-4 mr-2" /> Add Language</Button>
          </div>
        );

      case "achievements":
        return (
          <div className="space-y-4">
            {achievements.map((ach, idx) => (
              <Card key={ach.id} className="shadow-card">
                <CardContent className="p-3 flex items-center gap-2">
                  <Input value={ach.text} onChange={e => updateAch(idx, e.target.value)} className="h-8 text-sm flex-1" placeholder="Describe your achievement..." />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeAch(idx)}><Trash2 className="h-3 w-3" /></Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={addAch}><Plus className="h-4 w-4 mr-2" /> Add Achievement</Button>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-6 max-w-[1600px] mx-auto">
      {/* Editor Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h1 className="font-display text-xl font-bold">Resume Builder</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePDF}>
              <Download className="h-4 w-4 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleWord}>
              <FileText className="h-4 w-4 mr-1" /> Word
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleAISummary} disabled={aiLoading}>
              <Sparkles className="h-4 w-4 mr-1" /> {aiLoading ? "Working..." : "AI Improve"}
            </Button>
          </div>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Section sidebar - draggable order */}
          <div className="w-40 shrink-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Sections</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {sections.map(section => (
                  <SortableSectionTab
                    key={section.id}
                    section={section}
                    isActive={activeSection === section.id}
                    onClick={() => setActiveSection(section.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* Active section editor */}
          <ScrollArea className="flex-1">
            <div className="pr-4 pb-4">
              {renderSectionEditor()}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="hidden lg:block w-[480px] shrink-0">
        <Card className="shadow-elevated h-full overflow-auto">
          <CardContent className="p-0">
            <ResumePreview
              ref={previewRef}
              name={profile?.full_name || ""}
              email={user?.email || ""}
              personalDetails={personalDetails}
              objective={objective}
              profileSummary={profileSummary}
              title={resumeTitle}
              summary={summary}
              skills={skills}
              experiences={experiences}
              internships={internships}
              educations={educations}
              projects={projects}
              certifications={certifications}
              languages={languages}
              achievements={achievements}
              sections={sections}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
