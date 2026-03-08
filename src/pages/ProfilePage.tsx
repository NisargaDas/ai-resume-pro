import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Mail, Briefcase, Plus } from "lucide-react";

const skills = ["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "AWS", "Docker", "GraphQL"];

const experience = [
  { company: "TechCorp Inc.", role: "Senior Software Engineer", period: "2022 - Present" },
  { company: "StartupXYZ", role: "Software Engineer", period: "2020 - 2022" },
];

const education = [
  { school: "MIT", degree: "B.S. Computer Science", year: "2020" },
];

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card className="shadow-card overflow-hidden">
        <div className="h-24 gradient-hero" />
        <CardContent className="p-6 -mt-10">
          <div className="flex items-end gap-4">
            <Avatar className="h-20 w-20 border-4 border-card shadow-elevated">
              <AvatarFallback className="gradient-primary text-primary-foreground text-2xl font-bold">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-1">
              <h1 className="font-display text-xl font-bold text-foreground">John Doe</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> Senior Software Engineer
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> john@example.com</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> San Francisco, CA</span>
              </div>
            </div>
            <Button variant="outline" size="sm">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-foreground">Skills</h2>
            <Button variant="ghost" size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-foreground">Work Experience</h2>
            <Button variant="ghost" size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>
          <div className="space-y-4">
            {experience.map((exp, i) => (
              <div key={i}>
                <p className="font-medium text-foreground text-sm">{exp.role}</p>
                <p className="text-xs text-muted-foreground">{exp.company} · {exp.period}</p>
                {i < experience.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-foreground">Education</h2>
            <Button variant="ghost" size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>
          {education.map((edu, i) => (
            <div key={i}>
              <p className="font-medium text-foreground text-sm">{edu.degree}</p>
              <p className="text-xs text-muted-foreground">{edu.school} · {edu.year}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
