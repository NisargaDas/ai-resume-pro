import { forwardRef } from "react";
import type { ResumeSection, Experience, Education, Project, Certification, Language, Achievement } from "@/lib/resume-types";

interface ResumePreviewProps {
  name: string;
  email: string;
  title: string;
  summary: string;
  skills: string[];
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  achievements: Achievement[];
  sections: ResumeSection[];
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ name, email, title, summary, skills, experiences, educations, projects, certifications, languages, achievements, sections }, ref) => {

    const renderSection = (section: ResumeSection) => {
      switch (section.type) {
        case "summary":
          return summary ? (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Summary</h3>
              <p className="text-xs text-foreground leading-relaxed">{summary}</p>
            </div>
          ) : null;

        case "skills":
          return skills.length > 0 ? (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Skills</h3>
              <div className="flex flex-wrap gap-1">
                {skills.map(s => <span key={s} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">{s}</span>)}
              </div>
            </div>
          ) : null;

        case "experience":
          return experiences.length > 0 ? (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Experience</h3>
              {experiences.map(exp => (
                <div key={exp.id} className="mb-3">
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
          ) : null;

        case "education":
          return educations.length > 0 ? (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Education</h3>
              {educations.map(edu => (
                <div key={edu.id} className="flex justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{edu.degree || "Degree"}</p>
                    <p className="text-[10px] text-muted-foreground">{edu.school || "School"}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{edu.year}</span>
                </div>
              ))}
            </div>
          ) : null;

        case "projects":
          return projects.length > 0 ? (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Projects</h3>
              {projects.map(p => (
                <div key={p.id} className="mb-2">
                  <p className="text-xs font-semibold text-foreground">{p.name || "Project"}</p>
                  {p.description && <p className="text-[10px] text-muted-foreground">{p.description}</p>}
                  {p.technologies && <p className="text-[10px] text-primary/70 mt-0.5">{p.technologies}</p>}
                </div>
              ))}
            </div>
          ) : null;

        case "certifications":
          return certifications.length > 0 ? (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Certifications</h3>
              {certifications.map(c => (
                <div key={c.id} className="flex justify-between mb-1">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.issuer}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{c.year}</span>
                </div>
              ))}
            </div>
          ) : null;

        case "languages":
          return languages.length > 0 ? (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {languages.map(l => (
                  <span key={l.id} className="text-[10px] text-foreground">
                    {l.name} <span className="text-muted-foreground">({l.level})</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null;

        case "achievements":
          return achievements.length > 0 ? (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Achievements</h3>
              <ul className="space-y-0.5">
                {achievements.map(a => (
                  <li key={a.id} className="text-[10px] text-foreground pl-2 relative before:content-['•'] before:absolute before:left-0 before:text-muted-foreground">{a.text}</li>
                ))}
              </ul>
            </div>
          ) : null;

        default:
          return null;
      }
    };

    const hasContent = summary || skills.length > 0 || experiences.length > 0 || educations.length > 0 || projects.length > 0 || certifications.length > 0 || languages.length > 0 || achievements.length > 0;

    return (
      <div ref={ref} className="bg-card p-8 space-y-5" id="resume-preview">
        <div className="text-center border-b border-border pb-4">
          <h2 className="font-display text-xl font-bold text-foreground">{name || "Your Name"}</h2>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{email}</p>
        </div>

        {hasContent ? (
          sections.map(section => renderSection(section))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Start filling in the editor to see your resume preview</p>
          </div>
        )}
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";
