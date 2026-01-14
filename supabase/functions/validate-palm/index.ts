import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      throw new Error("No image provided");
    }

    // Call AI Service to validate if the image is a palm
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
              content: `Jesteś ekspertem od rozpoznawania obrazów. Twoim zadaniem jest sprawdzenie czy na zdjęciu widać ludzką dłoń (wewnętrzna strona z liniami papilarnym).

Odpowiedz TYLKO w formacie JSON:
{
  "isPalm": true/false,
  "confidence": 0-100,
  "message": "Krótki komunikat po polsku"
}

Jeśli to dłoń - isPalm: true, message: "Zdjęcie dłoni zostało rozpoznane"
Jeśli to NIE dłoń - isPalm: false, message: "To nie wygląda na zdjęcie dłoni. Prześlij zdjęcie wewnętrznej strony dłoni."`,
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: imageBase64 },
                },
                {
                  type: "text",
                  text: "Czy to zdjęcie przedstawia ludzką dłoń (wewnętrzną stronę z liniami)?",
                },
              ],
            },
          ],
          max_tokens: 200,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error("Validation failed");
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from AI");
    }

    // Parse JSON from response
    let validationResult;
    try {
      const jsonMatch =
        responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
        responseText.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;
      validationResult = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Default to accepting if we can't parse
      validationResult = {
        isPalm: true,
        confidence: 50,
        message: "Nie udało się zweryfikować zdjęcia, ale możesz kontynuować",
      };
    }

    return new Response(JSON.stringify(validationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error validating palm:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        isPalm: true,
        confidence: 0,
        message: "Błąd walidacji - możesz kontynuować",
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
