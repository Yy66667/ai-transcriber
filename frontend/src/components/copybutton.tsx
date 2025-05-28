import React, { useState } from "react";
import copySvg from "../assets/copy.svg";

export function CopyButton({ targetRef }: { targetRef: React.RefObject<HTMLDivElement | null> }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!targetRef.current) return;

    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(targetRef.current);
    selection?.removeAllRanges();
    selection?.addRange(range);

    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }

    selection?.removeAllRanges();
  };

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-2 flex justify-center items-center gap-2 text-md rounded-md font-bold bg-blue-600 text-white hover:bg-blue-700 transition"
    >
      {copied ? "Copied!" : ""}
      <img src={copySvg} className="w-5 h-5"  alt="" />
    </button>
    
  );
}
