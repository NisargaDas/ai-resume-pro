import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Copy, Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const resumes = [
  { id: "1", title: "Software Engineer Resume", template: "Modern", date: "Mar 5, 2026", score: 88 },
  { id: "2", title: "Product Manager CV", template: "Professional", date: "Mar 2, 2026", score: 76 },
  { id: "3", title: "Data Analyst Resume", template: "Minimal", date: "Feb 28, 2026", score: 92 },
  { id: "4", title: "Frontend Developer Resume", template: "Creative", date: "Feb 20, 2026", score: 84 },
  { id: "5", title: "UX Designer Resume", template: "Modern", date: "Feb 15, 2026", score: 70 },
];

export default function ResumeHistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Resume History</h1>
        <p className="text-muted-foreground mt-1">All your created resumes</p>
      </div>

      <div className="space-y-3">
        {resumes.map((resume) => (
          <Card key={resume.id} className="shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{resume.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {resume.template} · {resume.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">ATS: {resume.score}%</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/builder")}>Edit</DropdownMenuItem>
                    <DropdownMenuItem><Download className="h-4 w-4 mr-2" />Download</DropdownMenuItem>
                    <DropdownMenuItem><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
