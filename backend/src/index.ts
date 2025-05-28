import express, { NextFunction, Request, Response } from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document, Packer, Paragraph, TextRun } from "docx";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use("/downloads", express.static(path.join(__dirname, "..", "downloads")));

const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function fileToBase64(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString("base64");
}

app.post("/transcribe", upload.single("audio"), catchAsync(async (req, res:any) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  const promptPath = path.join(__dirname, "..", "src", "prompt.txt");

  if (!fs.existsSync(promptPath)) {
    return res.status(500).json({ error: "Prompt file not found" });
  }

  const prompt = fs.readFileSync(promptPath, "utf-8");
  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  try {
    const base64Audio = fileToBase64(filePath);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0 },
    });

    const result = await model.generateContent({
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

    const transcriptText = result.response.text();

const paragraphs = transcriptText.split("\n").filter(line => line.trim() !== "");

const doc = new Document({
  sections: [
    {
      children: paragraphs.map(line => {
        // First check for speaker pattern with bold
        const speakerMatch = line.match(/^\*\*(.+?):\*\*\s?(.*)/);
        if (speakerMatch) {
          const [, speaker, dialogue] = speakerMatch;
          
          // Check for italic text in dialogue
          const parts = dialogue.split(/(\*[^*]+\*)/g).map(part => {
            if (part.startsWith('*') && part.endsWith('*')) {
              // Remove asterisks and create italic text
              return new TextRun({
                text: part.slice(1, -1),
                italics: true
              });
            }
            return new TextRun({ text: part });
          });

          return new Paragraph({
            children: [
              new TextRun({ text: `${speaker}:`, bold: true }),
              ...parts
            ],
            spacing: { after: 200 },
          });
        } else {
          // Handle regular paragraphs with possible italic text
          const parts = line.split(/(\*[^*]+\*)/g).map(part => {
            if (part.startsWith('*') && part.endsWith('*')) {
              return new TextRun({
                text: part.slice(1, -1),
                italics: true
              });
            }
            return new TextRun({ text: part });
          });

          return new Paragraph({
            children: parts,
            spacing: { after: 200 },
          });
        }
      }),
    },
  ],
});


    const buffer = await Packer.toBuffer(doc);
    
    const fileId = uuidv4();
    const outputDir = path.join(__dirname, "..", "downloads");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const docxPath = path.join(outputDir, `${fileId}.docx`);
    fs.writeFileSync(docxPath, buffer);

    res.json({
      result: transcriptText,
      downloadUrl: `/downloads/${fileId}.docx`,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to transcribe audio" });
  } finally {
    fs.unlinkSync(filePath); // Clean up uploaded audio
  }
}));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
