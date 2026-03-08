import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean lines with a contemporary feel",
    tag: "Popular",
    colors: ["bg-primary", "bg-secondary"],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Traditional layout for corporate roles",
    tag: "Classic",
    colors: ["bg-foreground", "bg-muted-foreground"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant with lots of whitespace",
    tag: "Trending",
    colors: ["bg-muted-foreground", "bg-border"],
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold design for creative industries",
    tag: "New",
    colors: ["bg-accent", "bg-chart-5"],
  },
];

export default function TemplatesPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Resume Templates</h1>
        <p className="text-muted-foreground mt-1">Choose a template to get started</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {templates.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="shadow-card hover:shadow-float transition-all group cursor-pointer overflow-hidden">
              {/* Preview area */}
              <div className="h-52 bg-muted relative p-4 flex flex-col justify-between">
                <Badge variant="secondary" className="self-end text-[10px]">{t.tag}</Badge>
                {/* Mini resume preview */}
                <div className="space-y-2">
                  <div className={`h-2 w-16 rounded ${t.colors[0]} opacity-70`} />
                  <div className="h-1.5 w-full rounded bg-border" />
                  <div className="h-1.5 w-3/4 rounded bg-border" />
                  <div className="h-1.5 w-full rounded bg-border" />
                  <div className={`h-2 w-12 rounded ${t.colors[1]} opacity-50 mt-3`} />
                  <div className="h-1.5 w-full rounded bg-border" />
                  <div className="h-1.5 w-2/3 rounded bg-border" />
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-display font-semibold text-foreground">{t.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                <Button
                  size="sm"
                  className="w-full mt-3 gradient-primary text-primary-foreground text-xs"
                  onClick={() => navigate("/builder")}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
