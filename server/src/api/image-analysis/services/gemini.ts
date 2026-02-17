import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

const getMimeType = (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".png") return "image/png";
    if (ext === ".webp") return "image/webp";
    if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
    return "image/jpeg"; // fallback
};

export const analyzeImage = async (filePath: string) => {
    try {
        const base64ImageFile = fs.readFileSync(filePath, "base64");
        const mimeType = getMimeType(filePath);

        const prompt = `Extract every distinct food item visible in the image and estimate its calories in kcal using realistic portion assumptions when size isn't clear; return only valid JSON with the structure {"items":[{"food_name":string,"estimated_calories":number,"portion_assumption":string,"confidence":number}]} where confidence is 0-1.`;

        const config = {
            responseMimeType: "application/json",
            responseJsonSchema: {
                type: "object",
                additionalProperties: false,
                required: ["items"],
                properties: {
                    items: {
                        type: "array",
                        minItems: 1,
                        items: {
                            type: "object",
                            additionalProperties: false,
                            required: [
                                "food_name",
                                "estimated_calories",
                                "portion_assumption",
                                "confidence",
                            ],
                            properties: {
                                food_name: { type: "string" },
                                estimated_calories: { type: "number" },
                                portion_assumption: { type: "string" },
                                confidence: { type: "number", minimum: 0, maximum: 1 },
                            },
                        },
                    },
                },
            },
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType,
                                data: base64ImageFile,
                            },
                        },
                        { text: prompt },
                    ],
                },
            ],
            config
        });

        // Depending on SDK version, it may be response.text or response.response.text()
        const raw =
            (response as any).text ??
            (response as any)?.response?.text?.() ??
            "";

        if (!raw) {
            throw new Error("Gemini returned an empty response.");
        }

        // Extra safety: if it returns markdown-wrapped JSON, extract the JSON
        const jsonString = raw.trim().replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/, "").trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.log(error);
        throw (error);
    }
};