"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const genai_1 = require("@google/genai");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
const upload = (0, multer_1.default)({ dest: "uploads/" });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const genAI = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
function fileToBase64(filePath) {
    const fileBuffer = fs_1.default.readFileSync(filePath);
    return fileBuffer.toString("base64");
}
app.post("/transcribe", upload.single("audio"), async (req, res) => {
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to transcribe audio" });
    }
    finally {
        fs_1.default.unlinkSync(filePath); // delete uploaded file
    }
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
console.log(process.env.GEMINI_API_KEY);
