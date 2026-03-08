import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "improve-summary") {
      systemPrompt = "You are an expert resume writer. Improve the given professional summary to be more impactful, concise, and ATS-friendly. Return only the improved summary text.";
      userPrompt = `Improve this professional summary:\n\n${data.summary}\n\nJob description context: ${data.jobDescription || "General"}`;
    } else if (type === "improve-bullets") {
      systemPrompt = "You are an expert resume writer. Improve bullet points to use strong action verbs, quantify achievements, and be ATS-friendly. Return a JSON array of improved bullet strings.";
      userPrompt = `Improve these resume bullet points:\n\n${JSON.stringify(data.bullets)}\n\nRole: ${data.role || ""}`;
    } else if (type === "suggest-skills") {
      systemPrompt = "You are a career expert. Analyze the job description and suggest relevant skills. Return a JSON array of skill strings (max 10).";
      userPrompt = `Suggest skills for this job description:\n\n${data.jobDescription}`;
    } else if (type === "ats-score") {
      systemPrompt = `You are an ATS (Applicant Tracking System) expert. Analyze the resume against the job description. Return a JSON object with:
- score (number 0-100)
- missingKeywords (array of strings)
- suggestions (array of strings with improvement tips)
Return ONLY valid JSON, no markdown.`;
      userPrompt = `Resume:\nTitle: ${data.title}\nSummary: ${data.summary}\nSkills: ${JSON.stringify(data.skills)}\nExperiences: ${JSON.stringify(data.experiences)}\n\nJob Description:\n${data.jobDescription}`;
    } else if (type === "cover-letter") {
      systemPrompt = "You are an expert cover letter writer. Write a professional, personalized cover letter. Return only the cover letter text.";
      userPrompt = `Write a cover letter for:\nCompany: ${data.companyName}\nRole: ${data.jobRole}\nJob Description: ${data.jobDescription}\n\nCandidate info:\nName: ${data.name}\nSkills: ${JSON.stringify(data.skills)}\nExperience summary: ${data.summary}`;
    } else if (type === "job-match") {
      systemPrompt = `You are a career advisor. Based on the user's skills and experience, suggest 4-5 matching job roles. Return a JSON array of objects with:
- role (string)
- match (number 0-100)
- requiredSkills (array of strings)
- userHasSkills (array of strings the user already has)
Return ONLY valid JSON, no markdown.`;
      userPrompt = `User skills: ${JSON.stringify(data.skills)}\nExperience: ${data.summary}`;
    } else {
      throw new Error("Unknown AI request type: " + type);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
