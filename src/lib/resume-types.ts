import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, BorderStyle, convertMillimetersToTwip,
} from "docx";
import { saveAs } from "file-saver";

export interface PersonalDetails {
  phone: string;
  gender: string;
  linkedin: string;
  portfolio: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  bullets: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface Achievement {
  id: string;
  text: string;
}

export interface ResumeSection {
  id: string;
  type: "personal" | "summary" | "skills" | "experience" | "education" | "projects" | "certifications" | "languages" | "achievements";
  label: string;
}

export const DEFAULT_SECTIONS: ResumeSection[] = [
  { id: "personal", type: "personal", label: "Personal Details" },
  { id: "summary", type: "summary", label: "Summary" },
  { id: "skills", type: "skills", label: "Skills" },
  { id: "experience", type: "experience", label: "Experience" },
  { id: "education", type: "education", label: "Education" },
  { id: "projects", type: "projects", label: "Projects" },
  { id: "certifications", type: "certifications", label: "Certifications" },
  { id: "languages", type: "languages", label: "Languages" },
  { id: "achievements", type: "achievements", label: "Achievements" },
];

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function downloadResumePDF(element: HTMLElement, title: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const pdf = new jsPDF("p", "mm", "a4");

  let heightLeft = imgHeight;
  let position = 0;
  const imgData = canvas.toDataURL("image/png");

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

// ── Word (DOCX) export ──
export interface ResumeExportData {
  name: string;
  email: string;
  personalDetails: PersonalDetails;
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

export async function downloadResumeWord(data: ResumeExportData, title: string) {
  const children: Paragraph[] = [];

  if (data.name) {
    children.push(new Paragraph({
      children: [new TextRun({ text: data.name, bold: true, size: 32, font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }));
  }
  if (data.email) {
    children.push(new Paragraph({
      children: [new TextRun({ text: data.email, size: 20, font: "Calibri", color: "666666" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));
  }

  // Personal contact line
  const contactParts: string[] = [];
  if (data.personalDetails.phone) contactParts.push(data.personalDetails.phone);
  if (data.personalDetails.linkedin) contactParts.push(data.personalDetails.linkedin);
  if (data.personalDetails.portfolio) contactParts.push(data.personalDetails.portfolio);
  if (data.personalDetails.gender) contactParts.push(data.personalDetails.gender);
  if (contactParts.length > 0) {
    children.push(new Paragraph({
      children: [new TextRun({ text: contactParts.join("  |  "), size: 18, font: "Calibri", color: "666666" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));
  }

  const addHeading = (text: string) => {
    children.push(new Paragraph({
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, font: "Calibri", color: "2563EB" })],
      spacing: { before: 240, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
    }));
  };

  for (const section of data.sections) {
    switch (section.type) {
      case "summary":
        if (data.summary) {
          addHeading("Summary");
          children.push(new Paragraph({
            children: [new TextRun({ text: data.summary, size: 20, font: "Calibri" })],
            spacing: { after: 120 },
          }));
        }
        break;
      case "skills":
        if (data.skills.length > 0) {
          addHeading("Skills");
          children.push(new Paragraph({
            children: [new TextRun({ text: data.skills.join("  •  "), size: 20, font: "Calibri" })],
            spacing: { after: 120 },
          }));
        }
        break;
      case "experience":
        if (data.experiences.length > 0) {
          addHeading("Experience");
          for (const exp of data.experiences) {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: exp.role, bold: true, size: 21, font: "Calibri" }),
                new TextRun({ text: `  |  ${exp.company}`, size: 21, font: "Calibri" }),
              ],
              spacing: { before: 80 },
            }));
            if (exp.period) {
              children.push(new Paragraph({
                children: [new TextRun({ text: exp.period, size: 18, font: "Calibri", italics: true, color: "888888" })],
              }));
            }
            for (const bullet of exp.bullets.filter(b => b.trim())) {
              children.push(new Paragraph({
                children: [new TextRun({ text: bullet, size: 20, font: "Calibri" })],
                bullet: { level: 0 },
                spacing: { before: 20 },
              }));
            }
          }
        }
        break;
      case "education":
        if (data.educations.length > 0) {
          addHeading("Education");
          for (const edu of data.educations) {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: edu.degree, bold: true, size: 21, font: "Calibri" }),
                new TextRun({ text: `  |  ${edu.school}`, size: 21, font: "Calibri" }),
                ...(edu.year ? [new TextRun({ text: `  (${edu.year})`, size: 18, font: "Calibri", color: "888888" })] : []),
              ],
              spacing: { before: 60 },
            }));
          }
        }
        break;
      case "projects":
        if (data.projects.length > 0) {
          addHeading("Projects");
          for (const proj of data.projects) {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: proj.name, bold: true, size: 21, font: "Calibri" }),
                ...(proj.technologies ? [new TextRun({ text: `  (${proj.technologies})`, size: 18, font: "Calibri", color: "888888" })] : []),
              ],
              spacing: { before: 60 },
            }));
            if (proj.description) {
              children.push(new Paragraph({
                children: [new TextRun({ text: proj.description, size: 20, font: "Calibri" })],
                spacing: { before: 20 },
              }));
            }
          }
        }
        break;
      case "certifications":
        if (data.certifications.length > 0) {
          addHeading("Certifications");
          for (const cert of data.certifications) {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: cert.name, bold: true, size: 20, font: "Calibri" }),
                new TextRun({ text: ` — ${cert.issuer}`, size: 20, font: "Calibri" }),
                ...(cert.year ? [new TextRun({ text: ` (${cert.year})`, size: 18, font: "Calibri", color: "888888" })] : []),
              ],
              bullet: { level: 0 },
              spacing: { before: 40 },
            }));
          }
        }
        break;
      case "languages":
        if (data.languages.length > 0) {
          addHeading("Languages");
          children.push(new Paragraph({
            children: data.languages.map((l, i) => new TextRun({
              text: `${l.name} (${l.level})${i < data.languages.length - 1 ? "  •  " : ""}`,
              size: 20, font: "Calibri",
            })),
            spacing: { after: 120 },
          }));
        }
        break;
      case "achievements":
        if (data.achievements.filter(a => a.text.trim()).length > 0) {
          addHeading("Achievements");
          for (const ach of data.achievements.filter(a => a.text.trim())) {
            children.push(new Paragraph({
              children: [new TextRun({ text: ach.text, size: 20, font: "Calibri" })],
              bullet: { level: 0 },
              spacing: { before: 20 },
            }));
          }
        }
        break;
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: convertMillimetersToTwip(210), height: convertMillimetersToTwip(297) },
          margin: {
            top: convertMillimetersToTwip(20), bottom: convertMillimetersToTwip(20),
            left: convertMillimetersToTwip(20), right: convertMillimetersToTwip(20),
          },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.replace(/\s+/g, "_")}.docx`);
}
