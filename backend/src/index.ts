import express, { Request, Response } from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

function fileToBase64(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString("base64");
}

app.post("/transcribe", upload.single("audio"), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No audio file uploaded" });
    return;
  }

  const prompt = req.body.prompt || "Transcribe and summarize this audio";
  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  try {
    const base64Audio = fileToBase64(filePath);
    
    const result = await genAI.models.generateContent({
        model: "gemini-2.5",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Audio,
              },
            },
          ],
        },
      ],
    });

    
    const text = result.text;
    res.json({ result: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to transcribe audio" });
  } finally {
    fs.unlinkSync(filePath); // delete uploaded file
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

console.log(process.env.GEMINI_API_KEY)