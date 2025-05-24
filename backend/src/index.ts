import express, { Request, Response } from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "" );

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Tell me a joke about AI.");
    const response = await result.response;
    const text = response.text();
    console.log(text);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}


function fileToBase64(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString("base64");
}

app.post("/transcribe", upload.single("audio"), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No audio file uploaded" });
    return;
  }

  const prompt = fs.readFile("src/prompt.txt", "utf-8", (err,data)=>{
    if(err){
      console.log(err)
    }else {
      return data
    }
  });

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  try {
    const base64Audio = fileToBase64(filePath);
    
    

// Initialize with your API key

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "" );

// Load the model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0,
  },
});

// Send the prompt with audio
const result = await model.generateContent({
  contents: [
    {
      role: "user",
      parts: [
        { text: "" },
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

const response = await result.response;
console.log(response.text() );

run();

 ;
    res.json({ result: response.text() });
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

