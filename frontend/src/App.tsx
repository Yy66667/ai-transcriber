import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {CopyButton} from  "./components/copybutton";
import uploadSvg from "./assets/upload.svg";

export default function Transcribe() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

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

      const response = await fetch("http://localhost:3000/transcribe", {
        method: "POST",
        body: formData,
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

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-md shadow-md mt-10">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">Audio Transcription</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col justify-center items-center w-full border border-gray-300 rounded-md cursor-pointer p-4 text-gray-500 hover:bg-gray-50">
  <span id="file-label " className="flex flex-ROW items-center gap-2 text-[18px]">
      {audioFile ? audioFile.name :
          <>

          <img src={uploadSvg} className="w-6 h-6"  alt="" />
            <span className="text-gray-600">Click to upload an audio file </span>
            <span className="text-gray-600">or drag and drop it here</span> 
            
          </>}
  </span>
  <input
    type="file"
    accept="audio/*"
    onChange={handleFileChange}
    className="hidden"
  />
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
