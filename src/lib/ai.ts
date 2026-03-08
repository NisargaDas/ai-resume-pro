import { supabase } from "@/integrations/supabase/client";

export async function callAI(type: string, data: Record<string, unknown>) {
  const { data: result, error } = await supabase.functions.invoke("ai-resume", {
    body: { type, data },
  });

  if (error) throw new Error(error.message || "AI request failed");
  if (result?.error) throw new Error(result.error);
  return result.result as string;
}

export function parseAIJson<T>(raw: string): T {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}
