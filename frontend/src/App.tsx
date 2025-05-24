"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select an audio file");

    setLoading(true);

    const formData = new FormData();
    formData.append("audio", file);

    const response = await fetch("http://localhost:3000/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data.result);
    setLoading(false);
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎙️ Audio Transcriber (Gemini)</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />


        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {result && (
        <div className="mt-6 w-[700px]">
          <h2 className="font-semibold mb-2">Response:</h2>
          <pre className="bg-gray-100 p-4 rounded w-[400px] whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </main>
  );
}
