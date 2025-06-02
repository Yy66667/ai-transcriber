import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {CopyButton} from  "./components/copybutton";
import ModelSelector from "./components/selectmodel";
import uploadSvg from "./assets/upload.svg";

export default function Transcribe() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioFile(e.target.files?.[0] || null);
    setTranscript("");
    setDownloadUrl("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      setError("Please select an audio file first.");
      return;
    }

    setLoading(true);
    setError("");
    setTranscript("");
    setDownloadUrl("");

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("SelectModel", selectedModel); // Example model, can be dynamic

      const response = await fetch("http://localhost:3000/transcribe", {
        method: "POST",
        body: formData ,
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.error || "Failed to transcribe.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTranscript(data.result || "");
      setDownloadUrl(data.downloadUrl || "");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  const models = [
  "gemini-2.5-pro-exp-03-25",
  "gemini-2.5-pro-preview-03-25",
  "gemini-2.5-flash-preview-04-17",
  "gemini-2.5-flash-preview-05-20",
  "gemini-2.5-flash-preview-04-17-thinking",
  "gemini-2.5-pro-preview-05-06",
  "gemini-2.0-pro-exp",
  "gemini-2.0-pro-exp-02-05",
  "gemini-exp-1206",
  "gemini-2.0-flash-thinking-exp-01-21",
  "gemini-2.0-flash-thinking-exp",
  "gemini-2.0-flash-thinking-exp-1219",
  "gemini-2.5-flash-preview-tts",
  "gemini-2.5-pro-preview-tts",
  "gemini-2.0-flash",
]
;
  const handleModelSelect = (m: String) => {

    if (!m) {
      console.log('No model selected');
    }else{
    //@ts-ignore
    setSelectedModel(m);
    console.log('Selected model:', m);
    }
    // You can now use the selected model as needed
  };

const [dragActive, setDragActive] = useState(false);
const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);
  const file = e.dataTransfer.files?.[0];
  if (file) {
    console.log("File dropped:", file.name);
    setAudioFile(file);
    // handle the file
  }
};

const handleDrag = (e: React.DragEvent<HTMLLabelElement>) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.type === "dragenter" || e.type === "dragover") {
    setDragActive(true);
  } else if (e.type === "dragleave") {
    setDragActive(false);
  }
};


  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-md shadow-md mt-10">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">Audio Transcription</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors
          ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:bg-gray-50"}`}
      > <span id="file-label " className="flex flex-ROW items-center gap-2 text-[18px]">
      {audioFile ? audioFile.name :
          <>
        <img src={uploadSvg} className="w-6 h-6"  alt="" />
        <p className="text-gray-600">Drag and drop an audio file here or click to upload</p>
       
          </>}
           <input
          id="file-upload"
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
  </span>

      </label>


        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-semibold ${
            loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Transcribing..." : "Upload & Transcribe"}
        </button>

      <ModelSelector models={models} onSelect={handleModelSelect} />
      </form>

      {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}

      {transcript && (
        <div  ref={transcriptRef} className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md max-h-100 overflow-y-auto whitespace-pre-wrap text-gray-800">
          <ReactMarkdown>{transcript}</ReactMarkdown>
        </div>
      )}

      {downloadUrl && (
        <div className="mt-2 flex gap-2 justify-center items-center">
          <a
            href={`http://localhost:3000${downloadUrl}`}
            download
            target="_blank"
            rel="noopener noreferrer"
            className=" bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
          >
            Download Transcript (.docx)
          </a>

          {/* Copy button that copies formatted markdown */}
          <CopyButton targetRef={transcriptRef}/>
        </div>
      )}
    </div>
  );
}
