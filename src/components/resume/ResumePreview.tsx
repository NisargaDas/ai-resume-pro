import { forwardRef } from "react";
import type { ResumeSection, Experience, Internship, Education, Project, Certification, Language, Achievement, Hobby, PersonalDetails } from "@/lib/resume-types";

interface ResumePreviewProps {
  name: string;
  email: string;
  personalDetails: PersonalDetails;
  objective: string;
  profileSummary: string;
  title: string;
  summary: string;
  skills: string[];
  experiences: Experience[];
  internships: Internship[];
  educations: Education[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  achievements: Achievement[];
  hobbies: Hobby[];
  sections: ResumeSection[];
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ name, email, personalDetails, objective, profileSummary, title, summary, skills, experiences, internships, educations, projects, certifications, languages, achievements, hobbies, sections }, ref) => {

    const renderExpEntries = (entries: (Experience | Internship)[]) =>
      entries.map(exp => (
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
      ));

    const renderSection = (section: ResumeSection) => {
      switch (section.type) {
        case "personal": {
          const details = [personalDetails.phone, personalDetails.linkedin, personalDetails.portfolio].filter(Boolean);
          const hasData = details.length > 0 || personalDetails.gender || personalDetails.dob;
          return hasData ? (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Personal Details</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-foreground">
                {personalDetails.phone && <span>📞 {personalDetails.phone}</span>}
                {personalDetails.gender && <span>⚧ {personalDetails.gender}</span>}
                {personalDetails.dob && <span>🎂 {personalDetails.dob}</span>}
                {personalDetails.linkedin && <span>🔗 {personalDetails.linkedin}</span>}
                {personalDetails.portfolio && <span>🌐 {personalDetails.portfolio}</span>}
              </div>
            </div>
          ) : null;
        }

        case "objective":
          return objective ? (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Objective</h3>
              <p className="text-xs text-foreground leading-relaxed">{objective}</p>
            </div>
          ) : null;

        case "profile":
          return profileSummary ? (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Profile</h3>
              <p className="text-xs text-foreground leading-relaxed">{profileSummary}</p>
            </div>
          ) : null;

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
              {renderExpEntries(experiences)}
            </div>
          ) : null;

        case "internship":
          return internships.length > 0 ? (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Internship</h3>
              {renderExpEntries(internships)}
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
                    {(edu.grade || edu.distinction) && (
                      <p className="text-[10px] text-muted-foreground">
                        {[edu.grade, edu.distinction].filter(Boolean).join(" • ")}
                      </p>
                    )}
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

        case "hobbies":
          return hobbies.filter(h => h.name.trim()).length > 0 ? (
            <div key={section.id}>
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Hobbies</h3>
              <div className="flex flex-wrap gap-1">
                {hobbies.filter(h => h.name.trim()).map(h => (
                  <span key={h.id} className="text-[10px] bg-accent/50 text-accent-foreground px-2 py-0.5 rounded">{h.name}</span>
                ))}
              </div>
            </div>
          ) : null;

        default:
          return null;
      }
    };

    const hasContent = summary || objective || profileSummary || skills.length > 0 || experiences.length > 0 || internships.length > 0 || educations.length > 0 || projects.length > 0 || certifications.length > 0 || languages.length > 0 || achievements.length > 0 || hobbies.length > 0 || personalDetails.phone || personalDetails.linkedin || personalDetails.portfolio;

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
