import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Copy, Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ResumeHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("resumes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setResumes(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleDuplicate = async (resume: any) => {
    const { id, created_at, updated_at, ...rest } = resume;
    const { error } = await supabase.from("resumes").insert({ ...rest, title: `${rest.title} (Copy)` });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Resume duplicated!" }); load(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Resume deleted" }); load(); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Resume History</h1>
        <p className="text-muted-foreground mt-1">All your created resumes</p>
      </div>

      {resumes.length === 0 ? (
        <Card className="shadow-card"><CardContent className="p-8 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No resumes yet.</p>
          <Button className="mt-4 gradient-primary text-primary-foreground" onClick={() => navigate("/builder")}>Create Resume</Button>
        </CardContent></Card>
      ) : (
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
                    <p className="text-xs text-muted-foreground">{resume.template} · {new Date(resume.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {resume.ats_score && <Badge variant="secondary" className="text-xs">ATS: {resume.ats_score}%</Badge>}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/builder/${resume.id}`)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(resume)}><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(resume.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
