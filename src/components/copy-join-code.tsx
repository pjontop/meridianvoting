"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface CopyJoinCodeProps {
  joinCode: string;
}

export function CopyJoinCode({ joinCode }: CopyJoinCodeProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={copyToClipboard}
      className="shrink-0"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 mr-1" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 mr-1" />
          Copy
        </>
      )}
    </Button>
  );
}