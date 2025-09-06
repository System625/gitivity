"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { useState } from "react";

interface CopyLinkButtonProps {
  url: string;
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy link");
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 cursor-pointer"
    >
      <Icon 
        icon={copied ? "mdi:check" : "mdi:content-copy"} 
        className={`text-sm ${copied ? "text-green-500" : ""}`}
      />
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}