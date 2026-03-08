import { useRef } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

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
  type: "summary" | "skills" | "experience" | "education" | "projects" | "certifications" | "languages" | "achievements";
  label: string;
}

export const DEFAULT_SECTIONS: ResumeSection[] = [
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

  const imgWidth = 210; // A4 mm
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
