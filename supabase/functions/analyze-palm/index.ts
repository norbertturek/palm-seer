import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser(token);

    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const user = userData.user;

    // Check user credits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("analysis_credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error("Error fetching profile");
    }

    if (!profile || profile.analysis_credits < 1) {
      return new Response(
        JSON.stringify({
          error: "Brak kredytów. Kup pakiet analiz, aby kontynuować.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 402,
        }
      );
    }

    const body = await req.json();
    const { imageUrl, additionalNotes: rawNotes } = body;

    if (!imageUrl) {
      throw new Error("No image URL provided");
    }

    // Validate and sanitize additionalNotes to prevent prompt injection
    let additionalNotes = "";
    if (rawNotes && typeof rawNotes === "string") {
      // Limit length to 500 characters
      const trimmedNotes = rawNotes.slice(0, 500);
      // Remove characters that could break prompt structure or inject commands
      // Allow only alphanumeric, spaces, and basic punctuation
      additionalNotes = trimmedNotes
        .replace(/[^\p{L}\p{N}\s.,!?;:'"()\-–—]/gu, "")
        .trim();
    }

    // Call AI Service for palm reading analysis
    const aiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("GOOGLE_API_KEY")}`,
        },
        body: JSON.stringify({
          model: "gemini-1.5-flash",
          messages: [
            {
              role: "system",
              content: `Jesteś doświadczonym chiromantą i mistrzem czytania z dłoni z 30-letnim doświadczeniem. Przeprowadzasz kompleksową, rozbudowaną analizę obejmującą wszystkie aspekty chiromancji.

WAŻNE: Twoja analiza musi być BARDZO szczegółowa i rozbudowana. Im więcej informacji, tym lepiej dla użytkownika.

Twoja analiza MUSI zawierać:

1. **WYNIK OGÓLNY** (overallScore: 60-98) i szczegółowy opis osobowości (overview: minimum 4-5 zdań)

2. **LINIE DŁONI** - dla każdej linii podaj score (60-98), szczegółowy opis, głęboką interpretację i 4-5 cech:
   - Linia życia (lifeLine) - witalność, energia życiowa, zdrowie, główne wydarzenia życiowe
   - Linia serca (heartLine) - emocje, miłość, relacje, sposób wyrażania uczuć
   - Linia głowy (headLine) - intelekt, sposób myślenia, zdolności umysłowe, podejmowanie decyzji
   - Linia losu (fateLine) - ścieżka życiowa, kariera, przeznaczenie, zmiany życiowe
   - Linia słońca (sunLine) - sława, sukces, talenty artystyczne, szczęście
   - Linia Merkurego (mercuryLine) - komunikacja, zdrowie, umiejętności biznesowe

3. **WZGÓRZA DŁONI** (mounts) - analiza każdego wzgórza:
   - Wzgórze Jowisza - ambicja, przywództwo, pewność siebie
   - Wzgórze Saturna - odpowiedzialność, mądrość, cierpliwość
   - Wzgórze Apollo/Słońca - kreatywność, sława, talent artystyczny
   - Wzgórze Merkurego - komunikacja, inteligencja, umiejętności handlowe
   - Wzgórze Marsa - odwaga, agresja, asertywność
   - Wzgórze Wenus - miłość, pasja, zmysłowość
   - Wzgórze Księżyca - intuicja, wyobraźnia, podświadomość

4. **KSZTAŁT DŁONI** (handShape):
   - Typ dłoni (ziemia/woda/ogień/powietrze)
   - Kształt palców i ich znaczenie
   - Proporcje dłoni i co mówią o charakterze

5. **PROFIL OSOBOWOŚCI** (personality):
   - Mocne strony (strengths) - minimum 5 cech
   - Obszary do rozwoju (weaknesses) - minimum 3 cechy
   - Typ osobowości
   - Dominujący żywioł

6. **RELACJE I MIŁOŚĆ** (relationships):
   - Styl miłosny
   - Idealna partnerka/partner
   - Wyzwania w relacjach
   - Rada dla życia uczuciowego

7. **KARIERA I POWOŁANIE** (career):
   - Idealne zawody (minimum 5)
   - Talenty zawodowe
   - Ścieżka kariery
   - Potencjał finansowy

8. **ZDROWIE** (health):
   - Mocne strony zdrowotne
   - Obszary wymagające uwagi
   - Zalecenia wellness
   - Poziom energii

9. **TALENTY I ZDOLNOŚCI** (talents):
   - Ukryte talenty (minimum 4)
   - Zdolności artystyczne
   - Zdolności intelektualne
   - Zdolności społeczne

10. **ZNAKI SPECJALNE** (specialSigns) - minimum 3-5 znaków:
    - Gwiazdy, krzyże, trójkąty, kwadraty, wyspy
    - Ich lokalizacja i znaczenie

11. **PRZEPOWIEDNIE** (predictions):
    - Miłość (love) - szczegółowa przepowiednia
    - Kariera (career) - szczegółowa przepowiednia
    - Zdrowie (health) - szczegółowa przepowiednia
    - Finanse (wealth) - szczegółowa przepowiednia
    - Rozwój duchowy (spiritual) - szczegółowa przepowiednia
    - Najbliższe 12 miesięcy (shortTerm)
    - Perspektywa 5 lat (longTerm)

12. **SZCZĘŚLIWE ELEMENTY** (luckyElements):
    - Szczęśliwe liczby
    - Szczęśliwe dni tygodnia
    - Szczęśliwe kolory
    - Szczęśliwe kamienie/kryształy

13. **RADA NA PRZYSZŁOŚĆ** (advice) - rozbudowana, spersonalizowana rada (3-4 zdania)

FORMAT ODPOWIEDZI - JSON:
{
  "overallScore": 85,
  "overview": "Rozbudowany opis osobowości (4-5 zdań)...",
  "lifeLine": {
    "score": 88,
    "description": "Szczegółowy opis linii...",
    "interpretation": "Głęboka interpretacja...",
    "traits": ["Witalność", "Energia", "Odporność", "Długowieczność", "Siła"]
  },
  "heartLine": { "score": 92, "description": "...", "interpretation": "...", "traits": [...] },
  "headLine": { "score": 85, "description": "...", "interpretation": "...", "traits": [...] },
  "fateLine": { "score": 79, "description": "...", "interpretation": "...", "traits": [...] },
  "sunLine": { "score": 75, "description": "...", "interpretation": "...", "traits": [...] },
  "mercuryLine": { "score": 80, "description": "...", "interpretation": "...", "traits": [...] },
  "mounts": {
    "jupiter": { "strength": "wysoki/średni/niski", "meaning": "..." },
    "saturn": { "strength": "...", "meaning": "..." },
    "apollo": { "strength": "...", "meaning": "..." },
    "mercury": { "strength": "...", "meaning": "..." },
    "mars": { "strength": "...", "meaning": "..." },
    "venus": { "strength": "...", "meaning": "..." },
    "moon": { "strength": "...", "meaning": "..." }
  },
  "handShape": {
    "type": "ziemia/woda/ogień/powietrze",
    "description": "Szczegółowy opis...",
    "fingerAnalysis": "Analiza palców...",
    "proportions": "Analiza proporcji..."
  },
  "personality": {
    "type": "Typ osobowości",
    "element": "Dominujący żywioł",
    "strengths": ["Mocna strona 1", "Mocna strona 2", ...],
    "weaknesses": ["Obszar rozwoju 1", ...],
    "summary": "Podsumowanie osobowości..."
  },
  "relationships": {
    "loveStyle": "Opis stylu miłosnego...",
    "idealPartner": "Opis idealnego partnera...",
    "challenges": "Wyzwania w relacjach...",
    "advice": "Rada dla życia uczuciowego..."
  },
  "career": {
    "idealJobs": ["Zawód 1", "Zawód 2", "Zawód 3", "Zawód 4", "Zawód 5"],
    "talents": "Talenty zawodowe...",
    "path": "Ścieżka kariery...",
    "financialPotential": "Potencjał finansowy..."
  },
  "health": {
    "strengths": "Mocne strony zdrowotne...",
    "areasOfConcern": "Obszary wymagające uwagi...",
    "recommendations": "Zalecenia wellness...",
    "energyLevel": "wysoki/średni/niski"
  },
  "talents": {
    "hidden": ["Talent 1", "Talent 2", "Talent 3", "Talent 4"],
    "artistic": "Zdolności artystyczne...",
    "intellectual": "Zdolności intelektualne...",
    "social": "Zdolności społeczne..."
  },
  "specialSigns": [
    { "name": "Nazwa znaku", "meaning": "Znaczenie...", "location": "Lokalizacja..." }
  ],
  "predictions": {
    "love": "Szczegółowa przepowiednia miłosna...",
    "career": "Szczegółowa przepowiednia kariery...",
    "health": "Szczegółowa przepowiednia zdrowia...",
    "wealth": "Szczegółowa przepowiednia finansowa...",
    "spiritual": "Przepowiednia rozwoju duchowego...",
    "shortTerm": "Najbliższe 12 miesięcy...",
    "longTerm": "Perspektywa 5 lat..."
  },
  "luckyElements": {
    "numbers": [7, 3, 21],
    "days": ["Czwartek", "Niedziela"],
    "colors": ["Złoty", "Fioletowy"],
    "stones": ["Ametyst", "Cytryn"]
  },
  "advice": "Rozbudowana, spersonalizowana rada na przyszłość (3-4 zdania)..."
}
`,
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
                {
                  type: "text",
                  text: `Przeanalizuj dokładnie tę dłoń i podaj PEŁNĄ, ROZBUDOWANĄ analizę chiromancji obejmującą wszystkie aspekty wymienione w instrukcjach. Pamiętaj - im więcej szczegółów i informacji, tym lepiej dla użytkownika.${
                    additionalNotes
                      ? `\n\nDodatkowe informacje od użytkownika: ${additionalNotes}`
                      : ""
                  }`,
                },
              ],
            },
          ],
          max_tokens: 6000,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices?.[0]?.message?.content;

    if (!analysisText) {
      throw new Error("No analysis received from AI");
    }

    // Parse JSON from response
    let analysisResult;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch =
        analysisText.match(/```json\n?([\s\S]*?)\n?```/) ||
        analysisText.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : analysisText;
      analysisResult = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Create a fallback structure with the raw text
      analysisResult = {
        overview: analysisText,
        rawResponse: true,
      };
    }

    // Deduct credit
    const { error: deductError } = await supabaseAdmin
      .from("profiles")
      .update({ analysis_credits: profile.analysis_credits - 1 })
      .eq("user_id", user.id);

    if (deductError) {
      console.error("Error deducting credit:", deductError);
    }

    // Save analysis to database
    const { data: analysis, error: insertError } = await supabaseAdmin
      .from("analyses")
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        additional_notes: additionalNotes,
        analysis_result: analysisResult,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving analysis:", insertError);
    }

    return new Response(
      JSON.stringify({
        analysis: analysisResult,
        analysisId: analysis?.id,
        remainingCredits: profile.analysis_credits - 1,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error analyzing palm:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
