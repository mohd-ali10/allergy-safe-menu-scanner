import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: '10mb' }));

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Analyze Menu
  app.post("/api/analyze-menu", async (req, res) => {
    try {
      const { 
        allergies, 
        menuText, 
        image, 
        dietaryPreference = 'none', 
        strictness = 'standard', 
        outputLanguage = 'English',
        modelSelected = 'gemini-2.5-flash'
      } = req.body;

      if (!allergies || !Array.isArray(allergies) || allergies.length === 0) {
        return res.status(400).json({ error: "Allergies array is required." });
      }

      if (!menuText && !image) {
        return res.status(400).json({ error: "Menu text or image is required." });
      }

      let ai;
      try {
        console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY, "length:", process.env.GEMINI_API_KEY?.length);
        ai = new GoogleGenAI({ 
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
      } catch (err) {
        return res.status(500).json({ error: "Failed to initialize GenAI client." });
      }

      const dietText = dietaryPreference && dietaryPreference !== 'none'
        ? `- Dietary Preference rule: user is running a ${dietaryPreference.toUpperCase()} dietary plan. In addition to allergies, identify and flag any ingredients or dishes that violate this dietary preference (e.g., meat, fish, shellfish in vegetarian; meat, fish, poultry, dairy, eggs, honey in vegan). If found, classify as HIGH_RISK with explicit reasons.`
        : "";

      const strictnessText = strictness === 'extreme'
        ? `- Strictness Level: EXTREME VIGILANCE. If there is ANY reasonable risk, lack of manufacturing clarity, hidden food bases (eg. stock powders, sauces, shared fryers) or unknown ingredients, you MUST raise the classification to POSSIBLE_RISK or HIGH_RISK immediately. Do not give the benefit of the doubt.`
        : strictness === 'flexible'
        ? `- Strictness Level: MODERATE/FLEXIBLE. Be reasonable, and flag dishes only if there is a highly probable allergy occurrence. Do not overreact to tiny traces unless standard cuisine styles naturally use that ingredient.`
        : `- Strictness Level: STANDARD. Maintain healthy security guidelines. Point out potential raw ingredients and direct contacts.`;

      const languageText = outputLanguage && outputLanguage !== 'English'
        ? `- TRANSLATION MANDATE: All dish names, allergen lists, ingredient lists, explanations, and risk advice MUST be fully translated and printed in ${outputLanguage}. Keep it grammatically native and accurate.`
        : "";

      const prompt = `
        You are a food safety AI specializing in allergen detection.
        User Allergies: ${allergies.join(", ")}

        ${dietText}
        ${strictnessText}
        ${languageText}

        Your job:
        1. Extract all dishes from the menu.
        2. Identify ingredients (explicit and inferred).
        3. Detect allergens based on the user allergy list.
        4. Classify risk: SAFE, POSSIBLE_RISK, HIGH_RISK.
        5. Provide a short explanation.
        6. Provide a confidence score (0-100) based on how certain you are about the ingredients and risk level.

        Rules:
        - Infer hidden ingredients (e.g., pesto contains nuts/pine nuts, béchamel contains dairy/flour, soy sauce contains wheat/gluten).
        - Risk Classification Guidelines:
          * SAFE: No user allergens are present in the ingredients (explicit or inferred) and there is no high likelihood of cross-contamination.
          * POSSIBLE_RISK: Use this if there is a specific, reasonable suspicion of cross-contamination (e.g., shared fryers for gluten/shellfish) or if the dish's preparation varies significantly and often includes the allergen.
          * HIGH_RISK: The dish explicitly or inherently contains a user allergen.
        - If a dish explicitly contains a user allergen, mark as HIGH_RISK.
      `;

      const parts: any[] = [{ text: prompt }];
      if (image) {
        const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        } else {
          parts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: image.includes(",") ? image.split(",")[1] : image,
            },
          });
        }
      } else {
        parts.push({ text: `Menu Content:\n${menuText}` });
      }

      // Safeguard model choice
      const validModels = ["gemini-2.5-flash", "gemini-2.5-pro"];
      let modelToUse = validModels.includes(modelSelected) ? modelSelected : "gemini-2.5-flash";

      let response;
      try {
        response = await ai.models.generateContent({
          model: modelToUse,
          contents: [{ parts }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dish: { type: Type.STRING },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
                  risk: { type: Type.STRING, enum: ["SAFE", "POSSIBLE_RISK", "HIGH_RISK"] },
                  explanation: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                },
                required: ["dish", "ingredients", "allergens", "risk", "explanation", "confidence"],
              },
            },
          },
        });
      } catch (firstError: any) {
        console.warn(`Error generating content with model "${modelToUse}":`, firstError);
        // If the initial model was NOT gemini-2.5-flash, fall back to gemini-2.5-flash and try again!
        if (modelToUse !== "gemini-2.5-flash") {
          console.log("Quota or API error with", modelToUse, "- falling back to gemini-2.5-flash immediately.");
          modelToUse = "gemini-2.5-flash";
          response = await ai.models.generateContent({
            model: modelToUse,
            contents: [{ parts }],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dish: { type: Type.STRING },
                    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
                    risk: { type: Type.STRING, enum: ["SAFE", "POSSIBLE_RISK", "HIGH_RISK"] },
                    explanation: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                  },
                  required: ["dish", "ingredients", "allergens", "risk", "explanation", "confidence"],
                },
              },
            },
          });
        } else {
          throw firstError;
        }
      }

      if (!response.text) {
        throw new Error("Empty response from AI model");
      }

      let results;
      try {
        results = JSON.parse(response.text);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Response Text:", response.text);
        const jsonMatch = response.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          results = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      const processedResults = results.map((item: any) => {
        if (item.risk === "SAFE" && item.confidence < 70) {
          return {
            ...item,
            risk: "POSSIBLE_RISK",
            explanation: `Confidence is low (${item.confidence}%). ${item.explanation}`
          };
        }
        return item;
      });

      res.json(processedResults);
    } catch (error: any) {
      console.error("API Error:", error);
      const errorMsg = error?.message || "";
      res.status(500).json({ error: errorMsg || "Failed to analyze menu." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
