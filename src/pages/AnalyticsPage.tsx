import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const weeklyData = [
  { day: "Mon", downloads: 5, views: 18 },
  { day: "Tue", downloads: 8, views: 24 },
  { day: "Wed", downloads: 3, views: 15 },
  { day: "Thu", downloads: 12, views: 32 },
  { day: "Fri", downloads: 7, views: 28 },
  { day: "Sat", downloads: 4, views: 12 },
  { day: "Sun", downloads: 9, views: 20 },
];

const templateData = [
  { name: "Modern", value: 45 },
  { name: "Professional", value: 30 },
  { name: "Minimal", value: 15 },
  { name: "Creative", value: 10 },
];

const COLORS = [
  "hsl(239 84% 67%)",
  "hsl(142 71% 45%)",
  "hsl(38 92% 50%)",
  "hsl(280 67% 60%)",
];

const insights = [
  { label: "Most Downloaded", value: "Software Engineer Resume" },
  { label: "Best Template", value: "Modern (45 downloads)" },
  { label: "Avg ATS Score", value: "82%" },
  { label: "Total Views", value: "234" },
];

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your resume performance</p>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-display font-semibold text-foreground mt-1 text-sm">{item.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="downloads" fill="hsl(239 84% 67%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="views" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Template Distribution */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Template Usage</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={templateData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {templateData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
